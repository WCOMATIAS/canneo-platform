import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SCHEDULING_CONSTANTS } from '../constants/scheduling.constants';
import { ListSlotsQueryDto, SlotResponseDto, CreateSlotDto } from '../dto';

interface SlotReservation {
  slotId: string;
  appointmentId: string;
  reservedUntil: Date;
}

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  // Cache temporário de reservas (em produção usar Redis)
  private reservations = new Map<string, SlotReservation>();

  constructor(private readonly prisma: PrismaService) {}

  async listDoctorSlots(
    doctorId: string,
    query: ListSlotsQueryDto,
  ): Promise<SlotResponseDto[]> {
    const now = new Date();
    const minStartDate = new Date(
      now.getTime() + SCHEDULING_CONSTANTS.MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000,
    );

    const startDate = query.startDate
      ? new Date(query.startDate)
      : minStartDate;

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + SCHEDULING_CONSTANTS.MAX_BOOKING_ADVANCE_DAYS);

    const endDate = query.endDate
      ? new Date(query.endDate)
      : maxDate;

    const slots = await this.prisma.appointmentSlot.findMany({
      where: {
        doctorId,
        startsAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(query.includeBooked ? {} : { isBooked: false }),
      },
      orderBy: { startsAt: 'asc' },
    });

    return slots.map((slot) => ({
      id: slot.id,
      doctorId: slot.doctorId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      isBooked: slot.isBooked,
      isAvailable: !slot.isBooked && !this.isSlotReserved(slot.id),
    }));
  }

  async getSlotById(slotId: string) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    return slot;
  }

  async createSlots(doctorId: string, slots: CreateSlotDto[]): Promise<number> {
    // Validar que slots não sobrepõem
    const sortedSlots = [...slots].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = new Date(sortedSlots[i].endsAt);
      const next = new Date(sortedSlots[i + 1].startsAt);

      if (current > next) {
        throw new BadRequestException('Slots cannot overlap');
      }
    }

    // Validar que slots estão no futuro
    const now = new Date();
    for (const slot of sortedSlots) {
      if (new Date(slot.startsAt) <= now) {
        throw new BadRequestException('Slots must be in the future');
      }
    }

    // Criar slots
    const result = await this.prisma.appointmentSlot.createMany({
      data: sortedSlots.map((slot) => ({
        doctorId,
        startsAt: new Date(slot.startsAt),
        endsAt: new Date(slot.endsAt),
        isBooked: false,
      })),
      skipDuplicates: true,
    });

    this.logger.log(`Created ${result.count} slots for doctor ${doctorId}`);
    return result.count;
  }

  /**
   * Reserva temporária de slot (5 minutos)
   */
  async reserveSlot(slotId: string, appointmentId: string): Promise<Date> {
    const slot = await this.getSlotById(slotId);

    if (slot.isBooked) {
      throw new ConflictException('Slot is already booked');
    }

    if (this.isSlotReserved(slotId)) {
      throw new ConflictException('Slot is temporarily reserved');
    }

    const reservedUntil = new Date(
      Date.now() + SCHEDULING_CONSTANTS.SLOT_RESERVATION_MINUTES * 60 * 1000,
    );

    this.reservations.set(slotId, {
      slotId,
      appointmentId,
      reservedUntil,
    });

    this.logger.log(
      `Slot ${slotId} reserved until ${reservedUntil.toISOString()} for appointment ${appointmentId}`,
    );

    return reservedUntil;
  }

  /**
   * Confirma reserva (marca slot como booked)
   */
  async confirmSlotReservation(slotId: string, appointmentId: string): Promise<void> {
    const reservation = this.reservations.get(slotId);

    if (!reservation || reservation.appointmentId !== appointmentId) {
      throw new BadRequestException('Invalid or expired reservation');
    }

    await this.prisma.appointmentSlot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    this.reservations.delete(slotId);

    this.logger.log(`Slot ${slotId} confirmed for appointment ${appointmentId}`);
  }

  /**
   * Cancela reserva temporária
   */
  async releaseSlotReservation(slotId: string): Promise<void> {
    this.reservations.delete(slotId);
    this.logger.log(`Slot ${slotId} reservation released`);
  }

  /**
   * Libera slot (quando appointment é cancelado)
   */
  async releaseSlot(slotId: string): Promise<void> {
    await this.prisma.appointmentSlot.update({
      where: { id: slotId },
      data: { isBooked: false },
    });

    this.reservations.delete(slotId);

    this.logger.log(`Slot ${slotId} released`);
  }

  /**
   * Verifica se slot está reservado temporariamente
   */
  isSlotReserved(slotId: string): boolean {
    const reservation = this.reservations.get(slotId);
    if (!reservation) return false;

    if (new Date() > reservation.reservedUntil) {
      this.reservations.delete(slotId);
      return false;
    }

    return true;
  }

  /**
   * Processa expiração de reservas temporárias
   */
  async processExpiredReservations(): Promise<string[]> {
    const now = new Date();
    const expiredIds: string[] = [];

    for (const [slotId, reservation] of this.reservations.entries()) {
      if (now > reservation.reservedUntil) {
        expiredIds.push(reservation.appointmentId);
        this.reservations.delete(slotId);
        this.logger.log(`Reservation expired for slot ${slotId}`);
      }
    }

    return expiredIds;
  }

  /**
   * Deleta slots futuros não reservados
   */
  async deleteSlots(doctorId: string, slotIds: string[]): Promise<number> {
    const result = await this.prisma.appointmentSlot.deleteMany({
      where: {
        id: { in: slotIds },
        doctorId,
        isBooked: false,
        startsAt: { gt: new Date() },
      },
    });

    return result.count;
  }
}
