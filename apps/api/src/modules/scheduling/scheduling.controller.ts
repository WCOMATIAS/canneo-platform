import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, MfaGuard } from '../auth/guards';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { DoctorsService } from './services/doctors.service';
import { SlotsService } from './services/slots.service';
import { AppointmentsService } from './services/appointments.service';
import {
  ListDoctorsQueryDto,
  DoctorResponseDto,
  DoctorDetailResponseDto,
  ListSlotsQueryDto,
  SlotResponseDto,
  CreateSlotsDto,
  CreateAppointmentDto,
  AppointmentResponseDto,
  AppointmentDetailResponseDto,
  StartAppointmentDto,
  CompleteAppointmentDto,
  CancelAppointmentDto,
  ListAppointmentsQueryDto,
} from './dto';

@ApiTags('Scheduling')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, MfaGuard)
@ApiBearerAuth()
export class SchedulingController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly slotsService: SlotsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  // ============================================
  // DOCTORS
  // ============================================

  @Get('doctors')
  @Public()
  @ApiOperation({ summary: 'Listar médicos disponíveis' })
  @ApiResponse({ status: 200, type: [DoctorResponseDto] })
  async listDoctors(
    @Query() query: ListDoctorsQueryDto,
  ): Promise<{ doctors: DoctorResponseDto[]; total: number }> {
    return this.doctorsService.listDoctors(query);
  }

  @Get('doctors/:id')
  @Public()
  @ApiOperation({ summary: 'Obter detalhes de um médico' })
  @ApiParam({ name: 'id', description: 'ID do médico' })
  @ApiResponse({ status: 200, type: DoctorDetailResponseDto })
  async getDoctorById(
    @Param('id') id: string,
  ): Promise<DoctorDetailResponseDto> {
    return this.doctorsService.getDoctorById(id);
  }

  // ============================================
  // SLOTS
  // ============================================

  @Get('doctors/:id/slots')
  @Public()
  @ApiOperation({ summary: 'Listar slots disponíveis de um médico' })
  @ApiParam({ name: 'id', description: 'ID do médico' })
  @ApiResponse({ status: 200, type: [SlotResponseDto] })
  async listDoctorSlots(
    @Param('id') doctorId: string,
    @Query() query: ListSlotsQueryDto,
  ): Promise<SlotResponseDto[]> {
    return this.slotsService.listDoctorSlots(doctorId, query);
  }

  @Post('doctors/me/slots')
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar slots de disponibilidade (médico)' })
  @ApiResponse({ status: 201 })
  async createSlots(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSlotsDto,
  ): Promise<{ created: number }> {
    const doctor = await this.doctorsService.getDoctorByUserId(user.id);
    const created = await this.slotsService.createSlots(doctor.id, dto.slots);
    return { created };
  }

  @Get('doctors/me/slots')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Listar meus slots (médico)' })
  @ApiResponse({ status: 200, type: [SlotResponseDto] })
  async listMySlots(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSlotsQueryDto,
  ): Promise<SlotResponseDto[]> {
    const doctor = await this.doctorsService.getDoctorByUserId(user.id);
    return this.slotsService.listDoctorSlots(doctor.id, {
      ...query,
      includeBooked: true,
    });
  }

  // ============================================
  // APPOINTMENTS
  // ============================================

  @Post('appointments')
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar agendamento (paciente)' })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async createAppointment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto & { paymentIntentId: string; reservedUntil: Date }> {
    return this.appointmentsService.createAppointment(user.id, dto);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Listar agendamentos' })
  @ApiResponse({ status: 200, type: [AppointmentResponseDto] })
  async listAppointments(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.listAppointments(
      query,
      user.id,
      user.role,
    );
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Obter detalhes de um agendamento' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, type: AppointmentDetailResponseDto })
  async getAppointmentById(
    @Param('id') id: string,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentsService.getAppointmentById(id);

    return {
      id: appointment.id,
      status: appointment.status,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.user.fullName,
      patientId: appointment.patientId,
      patientName: appointment.patient.user.fullName,
      startsAt: appointment.slot!.startsAt,
      endsAt: appointment.slot!.endsAt,
      notes: appointment.notes ?? undefined,
      paymentIntentId: appointment.paymentIntentId ?? undefined,
      videoSessionUrl: appointment.videoSession?.roomUrl ?? undefined,
      createdAt: appointment.createdAt,
      startedAt: appointment.startedAt ?? undefined,
      endedAt: appointment.endedAt ?? undefined,
      amountCents: appointment.paymentIntent?.amountCents ?? undefined,
      paymentStatus: appointment.paymentIntent?.status ?? undefined,
    };
  }

  @Post('appointments/:id/start')
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar consulta (médico)' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, type: AppointmentDetailResponseDto })
  async startAppointment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    return this.appointmentsService.startAppointment(
      id,
      user.id,
      dto.initialNotes,
    );
  }

  @Post('appointments/:id/complete')
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completar consulta (médico)' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, type: AppointmentDetailResponseDto })
  async completeAppointment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    return this.appointmentsService.completeAppointment(id, user.id, dto);
  }

  @Post('appointments/:id/no-show')
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar como no-show (médico)' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  async markNoShow(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean }> {
    await this.appointmentsService.markNoShow(id, user.id);
    return { success: true };
  }

  @Post('appointments/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar agendamento' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  async cancelAppointment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CancelAppointmentDto,
  ): Promise<{ success: boolean }> {
    await this.appointmentsService.cancelAppointment(id, user.id, dto.reason);
    return { success: true };
  }
}
