import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListDoctorsQueryDto, DoctorResponseDto, DoctorDetailResponseDto } from '../dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDoctors(query: ListDoctorsQueryDto): Promise<{
    doctors: DoctorResponseDto[];
    total: number;
  }> {
    const where = {
      verifiedStatus: 'VERIFIED',
      user: {
        status: 'ACTIVE',
      },
      ...(query.specialty && { specialty: { contains: query.specialty, mode: 'insensitive' as const } }),
      ...(query.crmUF && { crmUF: query.crmUF.toUpperCase() }),
      ...(query.search && {
        user: {
          status: 'ACTIVE',
          fullName: { contains: query.search, mode: 'insensitive' as const },
        },
      }),
    };

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
        take: query.limit,
        skip: query.offset,
        orderBy: { user: { fullName: 'asc' } },
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return {
      doctors: doctors.map((d) => ({
        id: d.id,
        fullName: d.user.fullName,
        crmNumber: d.crmNumber,
        crmUF: d.crmUF,
        specialty: d.specialty ?? undefined,
        verifiedStatus: d.verifiedStatus,
      })),
      total,
    };
  }

  async getDoctorById(id: string): Promise<DoctorDetailResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        slots: {
          where: {
            isBooked: false,
            startsAt: { gte: new Date() },
          },
          select: { id: true },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor ${id} not found`);
    }

    return {
      id: doctor.id,
      fullName: doctor.user.fullName,
      crmNumber: doctor.crmNumber,
      crmUF: doctor.crmUF,
      specialty: doctor.specialty ?? undefined,
      verifiedStatus: doctor.verifiedStatus,
      consultationPriceCents: 15000, // TODO: Buscar do perfil do médico
      availableSlotsCount: doctor.slots.length,
    };
  }

  async getDoctorByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor profile not found for user ${userId}`);
    }

    return doctor;
  }
}
