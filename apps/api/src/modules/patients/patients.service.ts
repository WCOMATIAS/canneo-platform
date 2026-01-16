import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { OrganizationType } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private cryptoUtil: CryptoUtil,
  ) {}

  // ============================================================================
  // CREATE
  // ============================================================================

  async create(organizationId: string, dto: CreatePatientDto) {
    // Gera hash e criptografia do CPF
    const cpfHash = this.cryptoUtil.hashCpf(dto.cpf);
    const cpfEncrypted = this.cryptoUtil.encryptCpf(dto.cpf);
    const cpfLastFour = this.cryptoUtil.getLastFourDigits(dto.cpf);

    // Verifica se CPF já existe na organização
    const existingPatient = await this.prisma.patient.findUnique({
      where: {
        organizationId_cpfHash: {
          organizationId,
          cpfHash,
        },
      },
    });

    if (existingPatient) {
      throw new ConflictException('Paciente com este CPF já cadastrado');
    }

    return this.prisma.patient.create({
      data: {
        organizationId,
        cpfHash,
        cpfEncrypted,
        cpfLastFour,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        address: dto.address || {},
        allergies: dto.allergies || [],
        conditions: dto.conditions || [],
        medications: dto.medications || [],
        pipelineStatus: 'LEAD',
      },
      select: this.getPatientSelect(),
    });
  }

  // ============================================================================
  // FIND ALL (with pagination and search)
  // ============================================================================

  async findAll(
    organizationId: string,
    organizationType: OrganizationType,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      pipelineStatus?: string;
    } = {},
  ) {
    const { page = 1, limit = 20, search, pipelineStatus } = options;
    const skip = (page - 1) * limit;

    // Se for ASSOCIACAO, só retorna pacientes com consentimento
    let patientIds: string[] | undefined;
    if (organizationType === 'ASSOCIACAO') {
      const consents = await this.prisma.patientOrganization.findMany({
        where: {
          organizationId,
          consentGiven: true,
          revokedAt: null,
        },
        select: { patientId: true },
      });
      patientIds = consents.map((c) => c.patientId);

      if (patientIds.length === 0) {
        return { patients: [], total: 0, page, limit };
      }
    }

    const where: any = {};

    if (organizationType === 'ASSOCIACAO') {
      where.id = { in: patientIds };
    } else {
      where.organizationId = organizationId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpfLastFour: { contains: search } },
      ];
    }

    if (pipelineStatus) {
      where.pipelineStatus = pipelineStatus;
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.getPatientSelect(),
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // FIND BY ID
  // ============================================================================

  async findById(
    id: string,
    organizationId: string,
    organizationType: OrganizationType,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
          include: {
            doctor: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        patientOrganizations: {
          where: { organizationId },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // Verifica acesso
    if (organizationType === 'ASSOCIACAO') {
      const hasConsent = patient.patientOrganizations.some(
        (po) => po.consentGiven && !po.revokedAt,
      );
      if (!hasConsent) {
        throw new ForbiddenException('Paciente não autorizou acesso');
      }
    } else if (patient.organizationId !== organizationId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Descriptografa CPF para exibição
    const cpf = this.cryptoUtil.decryptCpf(patient.cpfEncrypted);

    return {
      ...patient,
      cpf,
      cpfEncrypted: undefined, // Remove do response
      cpfHash: undefined,
    };
  }

  // ============================================================================
  // FIND BY CPF
  // ============================================================================

  async findByCpf(cpf: string, organizationId: string) {
    const cpfHash = this.cryptoUtil.hashCpf(cpf);

    const patient = await this.prisma.patient.findUnique({
      where: {
        organizationId_cpfHash: {
          organizationId,
          cpfHash,
        },
      },
      select: this.getPatientSelect(),
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return patient;
  }

  // ============================================================================
  // UPDATE
  // ============================================================================

  async update(id: string, organizationId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (patient.organizationId !== organizationId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        address: dto.address ? dto.address : undefined,
      },
      select: this.getPatientSelect(),
    });
  }

  // ============================================================================
  // UPDATE PIPELINE STATUS
  // ============================================================================

  async updatePipelineStatus(
    id: string,
    organizationId: string,
    status: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient || patient.organizationId !== organizationId) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return this.prisma.patient.update({
      where: { id },
      data: { pipelineStatus: status },
      select: this.getPatientSelect(),
    });
  }

  // ============================================================================
  // PIPELINE SUMMARY (for Kanban)
  // ============================================================================

  async getPipelineSummary(organizationId: string) {
    const counts = await this.prisma.patient.groupBy({
      by: ['pipelineStatus'],
      where: { organizationId },
      _count: { id: true },
    });

    const statuses = [
      'LEAD',
      'CONTATO_INICIAL',
      'CONSULTA_AGENDADA',
      'EM_CONSULTA',
      'PRESCRICAO_EMITIDA',
      'DOCUMENTACAO_ANVISA',
      'SUBMETIDO_ANVISA',
      'APROVADO',
      'EM_TRATAMENTO',
      'INATIVO',
    ];

    return statuses.map((status) => ({
      status,
      count: counts.find((c) => c.pipelineStatus === status)?._count?.id || 0,
    }));
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getPatientSelect() {
    return {
      id: true,
      name: true,
      cpfLastFour: true,
      email: true,
      phone: true,
      birthDate: true,
      gender: true,
      address: true,
      allergies: true,
      conditions: true,
      medications: true,
      pipelineStatus: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
