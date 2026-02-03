import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  PaymentKind,
  PaymentIntentStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentIntentService } from '../../payments/services/payment-intent.service';
import { SlotsService } from './slots.service';
import { DoctorsService } from './doctors.service';
import {
  SCHEDULING_CONSTANTS,
  APPOINTMENT_STATE_TRANSITIONS,
} from '../constants/scheduling.constants';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
  AppointmentDetailResponseDto,
  CompleteAppointmentDto,
  ListAppointmentsQueryDto,
} from '../dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slotsService: SlotsService,
    private readonly doctorsService: DoctorsService,
    private readonly paymentIntentService: PaymentIntentService,
  ) {}

  /**
   * FLUXO PAY FIRST, SCHEDULE AFTER:
   * 1. Paciente escolhe médico e slot
   * 2. Appointment DRAFT criado
   * 3. Checkout cria PaymentIntent PENDING
   * 4. Slot reservado 5min
   * 5. APPROVED → Appointment CONFIRMED
   * 6. FAILED/EXPIRED → Appointment CANCELLED, slot liberado
   */
  async createAppointment(
    patientUserId: string,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto & { paymentIntentId: string; reservedUntil: Date }> {
    // 1. Buscar paciente
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
      include: { user: { select: { fullName: true } } },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // 2. Validar médico
    const doctor = await this.doctorsService.getDoctorById(dto.doctorId);

    if (doctor.verifiedStatus !== 'VERIFIED') {
      throw new BadRequestException('Doctor is not verified');
    }

    // 3. Validar e obter slot
    const slot = await this.slotsService.getSlotById(dto.slotId);

    if (slot.doctorId !== dto.doctorId) {
      throw new BadRequestException('Slot does not belong to this doctor');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot is already booked');
    }

    // Validar antecedência mínima
    const minStart = new Date(
      Date.now() + SCHEDULING_CONSTANTS.MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000,
    );
    if (slot.startsAt < minStart) {
      throw new BadRequestException(
        `Appointment must be scheduled at least ${SCHEDULING_CONSTANTS.MIN_BOOKING_ADVANCE_HOURS} hours in advance`,
      );
    }

    // 4. Criar appointment em DRAFT
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: patient.tenantId,
        status: AppointmentStatus.DRAFT,
        doctorId: dto.doctorId,
        patientId: patient.id,
        slotId: dto.slotId,
        notes: dto.notes,
      },
      include: {
        doctor: {
          include: { user: { select: { fullName: true } } },
        },
        patient: {
          include: { user: { select: { fullName: true } } },
        },
        slot: true,
      },
    });

    // 5. Reservar slot temporariamente (5 min)
    const reservedUntil = await this.slotsService.reserveSlot(
      dto.slotId,
      appointment.id,
    );

    // 6. Criar PaymentIntent
    const paymentIntentId = await this.paymentIntentService.create({
      kind: PaymentKind.CONSULT,
      method: dto.paymentMethod,
      amountCents: doctor.consultationPriceCents,
      customerUserId: patientUserId,
      tenantId: patient.tenantId ?? undefined,
      appointmentId: appointment.id,
    });

    // 7. Atualizar appointment com paymentIntentId e status
    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        paymentIntentId,
        status: AppointmentStatus.AWAITING_PAYMENT,
      },
    });

    // 8. Atualizar PaymentIntent status para PENDING
    await this.paymentIntentService.updateStatus(
      paymentIntentId,
      PaymentIntentStatus.PENDING,
    );

    this.logger.log(
      `Appointment ${appointment.id} created, awaiting payment. Reserved until ${reservedUntil.toISOString()}`,
    );

    return {
      id: appointment.id,
      status: AppointmentStatus.AWAITING_PAYMENT,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.user.fullName,
      patientId: appointment.patientId,
      patientName: appointment.patient.user.fullName,
      startsAt: appointment.slot!.startsAt,
      endsAt: appointment.slot!.endsAt,
      notes: appointment.notes ?? undefined,
      paymentIntentId,
      createdAt: appointment.createdAt,
      reservedUntil,
    };
  }

  /**
   * Callback quando pagamento é aprovado
   */
  async onPaymentApproved(appointmentId: string): Promise<void> {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== AppointmentStatus.AWAITING_PAYMENT) {
      this.logger.warn(
        `Appointment ${appointmentId} is not awaiting payment, current status: ${appointment.status}`,
      );
      return;
    }

    // Confirmar reserva do slot
    if (appointment.slotId) {
      await this.slotsService.confirmSlotReservation(
        appointment.slotId,
        appointmentId,
      );
    }

    // Atualizar status para CONFIRMED
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CONFIRMED },
    });

    this.logger.log(`Appointment ${appointmentId} confirmed after payment`);

    // TODO: Enviar notificações para médico e paciente
    // TODO: Criar sala de vídeo
  }

  /**
   * Callback quando pagamento falha ou expira
   */
  async onPaymentFailedOrExpired(appointmentId: string): Promise<void> {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== AppointmentStatus.AWAITING_PAYMENT) {
      return;
    }

    // Liberar reserva do slot
    if (appointment.slotId) {
      await this.slotsService.releaseSlotReservation(appointment.slotId);
    }

    // Cancelar appointment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    this.logger.log(
      `Appointment ${appointmentId} cancelled due to payment failure/expiration`,
    );
  }

  /**
   * Iniciar consulta (médico)
   */
  async startAppointment(
    appointmentId: string,
    doctorUserId: string,
    initialNotes?: string,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.getAppointmentById(appointmentId);

    // Verificar que é o médico da consulta
    const doctor = await this.doctorsService.getDoctorByUserId(doctorUserId);
    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('Not your appointment');
    }

    // Validar transição de estado
    this.validateStateTransition(appointment.status, AppointmentStatus.IN_PROGRESS);

    // Verificar janela de tolerância
    const now = new Date();
    const slot = appointment.slot!;
    const windowStart = new Date(
      slot.startsAt.getTime() - SCHEDULING_CONSTANTS.START_TOLERANCE_MINUTES * 60 * 1000,
    );
    const windowEnd = new Date(
      slot.startsAt.getTime() + SCHEDULING_CONSTANTS.START_TOLERANCE_MINUTES * 60 * 1000,
    );

    if (now < windowStart || now > windowEnd) {
      throw new BadRequestException(
        `Appointment can only be started within ${SCHEDULING_CONSTANTS.START_TOLERANCE_MINUTES} minutes of scheduled time`,
      );
    }

    // Atualizar appointment
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.IN_PROGRESS,
        startedAt: now,
        notes: initialNotes ?? appointment.notes,
      },
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
        slot: true,
        videoSession: true,
      },
    });

    this.logger.log(`Appointment ${appointmentId} started`);

    return this.mapToDetailResponse(updated);
  }

  /**
   * Completar consulta (médico)
   */
  async completeAppointment(
    appointmentId: string,
    doctorUserId: string,
    dto: CompleteAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.getAppointmentById(appointmentId);

    // Verificar que é o médico da consulta
    const doctor = await this.doctorsService.getDoctorByUserId(doctorUserId);
    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('Not your appointment');
    }

    // Validar transição de estado
    this.validateStateTransition(appointment.status, AppointmentStatus.COMPLETED);

    // Atualizar appointment
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.COMPLETED,
        endedAt: new Date(),
        notes: dto.finalNotes
          ? `${appointment.notes ?? ''}\n\n--- Evolução ---\n${dto.finalNotes}`
          : appointment.notes,
      },
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
        slot: true,
        videoSession: true,
      },
    });

    this.logger.log(`Appointment ${appointmentId} completed`);

    return this.mapToDetailResponse(updated);
  }

  /**
   * Marcar como no-show
   */
  async markNoShow(
    appointmentId: string,
    doctorUserId: string,
  ): Promise<void> {
    const appointment = await this.getAppointmentById(appointmentId);

    const doctor = await this.doctorsService.getDoctorByUserId(doctorUserId);
    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('Not your appointment');
    }

    this.validateStateTransition(appointment.status, AppointmentStatus.NO_SHOW);

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.NO_SHOW,
        endedAt: new Date(),
      },
    });

    this.logger.log(`Appointment ${appointmentId} marked as no-show`);
  }

  /**
   * Cancelar appointment
   */
  async cancelAppointment(
    appointmentId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    const appointment = await this.getAppointmentById(appointmentId);

    // Verificar permissão (paciente, médico ou admin)
    // TODO: Implementar lógica de permissão mais sofisticada

    this.validateStateTransition(appointment.status, AppointmentStatus.CANCELLED);

    // Liberar slot se tiver
    if (appointment.slotId) {
      await this.slotsService.releaseSlot(appointment.slotId);
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes: `${appointment.notes ?? ''}\n\n--- Cancelamento ---\n${reason}`,
      },
    });

    this.logger.log(`Appointment ${appointmentId} cancelled. Reason: ${reason}`);

    // TODO: Processar estorno se aplicável
  }

  /**
   * Obter appointment por ID
   */
  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
        slot: true,
        videoSession: true,
        paymentIntent: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }

    return appointment;
  }

  /**
   * Listar appointments
   */
  async listAppointments(
    query: ListAppointmentsQueryDto,
    userId: string,
    userRole: string,
  ): Promise<AppointmentResponseDto[]> {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    // Filtrar por data do slot
    if (query.startDate || query.endDate) {
      where.slot = {
        ...(query.startDate && { startsAt: { gte: new Date(query.startDate) } }),
        ...(query.endDate && { startsAt: { lte: new Date(query.endDate) } }),
      };
    }

    // Aplicar filtro de acesso baseado no role
    if (userRole === 'DOCTOR') {
      const doctor = await this.doctorsService.getDoctorByUserId(userId);
      where.doctorId = doctor.id;
    } else if (userRole === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      if (patient) {
        where.patientId = patient.id;
      }
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
        slot: true,
        videoSession: true,
      },
      orderBy: { slot: { startsAt: 'asc' } },
      take: 50,
    });

    return appointments.map((a) => this.mapToResponse(a));
  }

  private validateStateTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): void {
    const allowedTransitions = APPOINTMENT_STATE_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private mapToResponse(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      status: appointment.status,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.user.fullName,
      patientId: appointment.patientId,
      patientName: appointment.patient.user.fullName,
      startsAt: appointment.slot?.startsAt,
      endsAt: appointment.slot?.endsAt,
      notes: appointment.notes ?? undefined,
      paymentIntentId: appointment.paymentIntentId ?? undefined,
      videoSessionUrl: appointment.videoSession?.roomUrl ?? undefined,
      createdAt: appointment.createdAt,
    };
  }

  private mapToDetailResponse(appointment: any): AppointmentDetailResponseDto {
    return {
      ...this.mapToResponse(appointment),
      startedAt: appointment.startedAt ?? undefined,
      endedAt: appointment.endedAt ?? undefined,
      amountCents: appointment.paymentIntent?.amountCents ?? undefined,
      paymentStatus: appointment.paymentIntent?.status ?? undefined,
    };
  }
}
