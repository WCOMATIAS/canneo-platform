import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CREATE CONSULTATION (Book appointment)
  // ============================================================================

  async create(organizationId: string, dto: CreateConsultationDto) {
    // Verify patient exists and belongs to organization
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: dto.patientId,
        organizationId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Medico nao encontrado');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    const duration = dto.duration || 60;

    // Check for conflicting appointments
    const conflict = await this.prisma.consultation.findFirst({
      where: {
        doctorId: dto.doctorId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - duration * 60000),
          lte: new Date(scheduledAt.getTime() + duration * 60000),
        },
      },
    });

    if (conflict) {
      throw new BadRequestException('Horario ja ocupado');
    }

    // Generate unique room name for Daily.co
    const roomName = `canneo-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return this.prisma.consultation.create({
      data: {
        organizationId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        type: dto.type,
        scheduledAt,
        duration,
        notes: dto.notes,
        dailyRoomName: roomName,
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  // ============================================================================
  // FIND ALL (with filters)
  // ============================================================================

  async findAll(
    organizationId: string,
    options: {
      status?: ConsultationStatus;
      doctorId?: string;
      patientId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const {
      status,
      doctorId,
      patientId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = startDate;
      if (endDate) where.scheduledAt.lte = endDate;
    }

    const [consultations, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpfLastFour: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      consultations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // FIND BY ID
  // ============================================================================

  async findById(id: string, organizationId: string) {
    const consultation = await this.prisma.consultation.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            birthDate: true,
            gender: true,
            allergies: true,
            conditions: true,
            medications: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    return consultation;
  }

  // ============================================================================
  // UPDATE CONSULTATION
  // ============================================================================

  async update(id: string, organizationId: string, dto: UpdateConsultationDto) {
    const consultation = await this.prisma.consultation.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    // Validate status transitions
    if (dto.status) {
      this.validateStatusTransition(consultation.status, dto.status);
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  // ============================================================================
  // CONFIRM CONSULTATION
  // ============================================================================

  async confirm(id: string, organizationId: string) {
    const consultation = await this.findById(id, organizationId);

    if (consultation.status !== 'SCHEDULED') {
      throw new BadRequestException(
        'Apenas consultas agendadas podem ser confirmadas',
      );
    }

    return this.prisma.consultation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }

  // ============================================================================
  // CANCEL CONSULTATION
  // ============================================================================

  async cancel(id: string, organizationId: string, reason?: string) {
    const consultation = await this.findById(id, organizationId);

    if (['COMPLETED', 'CANCELED'].includes(consultation.status)) {
      throw new BadRequestException(
        'Consulta ja finalizada ou cancelada',
      );
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        status: 'CANCELED',
        cancelReason: reason,
      },
    });
  }

  // ============================================================================
  // START CONSULTATION
  // ============================================================================

  async start(id: string, organizationId: string, doctorId: string) {
    const consultation = await this.findById(id, organizationId);

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('Apenas o medico pode iniciar a consulta');
    }

    if (!['SCHEDULED', 'CONFIRMED', 'WAITING'].includes(consultation.status)) {
      throw new BadRequestException(
        'Consulta nao pode ser iniciada neste status',
      );
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  // ============================================================================
  // END CONSULTATION
  // ============================================================================

  async end(id: string, organizationId: string, doctorId: string) {
    const consultation = await this.findById(id, organizationId);

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('Apenas o medico pode finalizar a consulta');
    }

    if (consultation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Consulta nao esta em andamento');
    }

    // Update patient pipeline status
    await this.prisma.patient.update({
      where: { id: consultation.patientId },
      data: { pipelineStatus: 'PRESCRICAO_EMITIDA' },
    });

    return this.prisma.consultation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });
  }

  // ============================================================================
  // MARK NO SHOW
  // ============================================================================

  async markNoShow(id: string, organizationId: string) {
    const consultation = await this.findById(id, organizationId);

    if (!['SCHEDULED', 'CONFIRMED'].includes(consultation.status)) {
      throw new BadRequestException(
        'Apenas consultas agendadas podem ser marcadas como no-show',
      );
    }

    return this.prisma.consultation.update({
      where: { id },
      data: { status: 'NO_SHOW' },
    });
  }

  // ============================================================================
  // GET TODAY'S CONSULTATIONS
  // ============================================================================

  async getTodayConsultations(organizationId: string, doctorId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      organizationId,
      scheduledAt: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ['SCHEDULED', 'CONFIRMED', 'WAITING', 'IN_PROGRESS'],
      },
    };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.prisma.consultation.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpfLastFour: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  // ============================================================================
  // GET UPCOMING CONSULTATIONS
  // ============================================================================

  async getUpcoming(organizationId: string, doctorId?: string, limit = 10) {
    const now = new Date();

    const where: any = {
      organizationId,
      scheduledAt: { gte: now },
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
    };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.prisma.consultation.findMany({
      where,
      take: limit,
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private validateStatusTransition(
    current: ConsultationStatus,
    next: ConsultationStatus,
  ) {
    const validTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
      SCHEDULED: ['CONFIRMED', 'CANCELED', 'NO_SHOW'],
      CONFIRMED: ['WAITING', 'IN_PROGRESS', 'CANCELED', 'NO_SHOW'],
      WAITING: ['IN_PROGRESS', 'CANCELED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      CANCELED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Transicao de status invalida: ${current} -> ${next}`,
      );
    }
  }
}
