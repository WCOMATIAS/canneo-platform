import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CREATE AVAILABILITY (recurring weekly slot)
  // ============================================================================

  async create(
    organizationId: string,
    doctorId: string,
    dto: CreateAvailabilityDto,
  ) {
    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        'startTime must be before endTime',
      );
    }

    // Check for overlapping availability
    const existing = await this.prisma.availability.findFirst({
      where: {
        doctorId,
        dayOfWeek: dto.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: dto.startTime } },
              { endTime: { gt: dto.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: dto.endTime } },
              { endTime: { gte: dto.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: dto.startTime } },
              { endTime: { lte: dto.endTime } },
            ],
          },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Availability overlaps with existing slot',
      );
    }

    return this.prisma.availability.create({
      data: {
        organizationId,
        doctorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
        breakStart: dto.breakStart || null,
        breakEnd: dto.breakEnd || null,
      },
    });
  }

  // ============================================================================
  // GET DOCTOR'S AVAILABILITY CONFIGURATION
  // ============================================================================

  async findByDoctor(doctorId: string) {
    return this.prisma.availability.findMany({
      where: {
        doctorId,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  // ============================================================================
  // GET AVAILABLE SLOTS FOR A DATE RANGE
  // ============================================================================

  async getAvailableSlots(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Get doctor's availability configuration
    const availabilities = await this.prisma.availability.findMany({
      where: {
        doctorId,
        isActive: true,
      },
    });

    // Get existing consultations in the date range
    const existingConsultations = await this.prisma.consultation.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Generate slots
    const slots: Array<{
      date: string;
      startTime: string;
      endTime: string;
      available: boolean;
    }> = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      // Find availability for this day
      const dayAvailabilities = availabilities.filter(
        (a) => a.dayOfWeek === dayOfWeek,
      );

      for (const availability of dayAvailabilities) {
        // Generate time slots
        const [startHour, startMin] = availability.startTime.split(':').map(Number);
        const [endHour, endMin] = availability.endTime.split(':').map(Number);

        let slotStart = startHour * 60 + startMin;
        const slotEnd = endHour * 60 + endMin;

        while (slotStart + availability.slotDuration <= slotEnd) {
          const slotStartTime = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
          const slotEndMinutes = slotStart + availability.slotDuration;
          const slotEndTime = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`;

          // Check if slot is already booked
          const slotDateTime = new Date(`${dateStr}T${slotStartTime}:00`);
          const isBooked = existingConsultations.some((c) => {
            const consultStart = new Date(c.scheduledAt);
            const consultEnd = new Date(consultStart.getTime() + c.duration * 60000);
            return slotDateTime >= consultStart && slotDateTime < consultEnd;
          });

          // Check if slot is in the past
          const isPast = slotDateTime < new Date();

          slots.push({
            date: dateStr,
            startTime: slotStartTime,
            endTime: slotEndTime,
            available: !isBooked && !isPast,
          });

          slotStart += availability.slotDuration;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  // ============================================================================
  // UPDATE AVAILABILITY
  // ============================================================================

  async update(
    id: string,
    doctorId: string,
    dto: UpdateAvailabilityDto,
  ) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.doctorId !== doctorId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.availability.update({
      where: { id },
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
        breakStart: dto.breakStart,
        breakEnd: dto.breakEnd,
        isActive: dto.isActive,
      },
    });
  }

  // ============================================================================
  // DELETE (soft delete)
  // ============================================================================

  async delete(id: string, doctorId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.doctorId !== doctorId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.availability.update({
      where: { id },
      data: { isActive: false },
    });
  }

}
