import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private cryptoUtil: CryptoUtil,
  ) {}

  // ============================================================================
  // CREATE PRESCRIPTION
  // ============================================================================

  async create(doctorId: string, dto: CreatePrescriptionDto) {
    // Get medical record and verify ownership
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
      include: { consultation: true },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    if (medicalRecord.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico do prontuario pode criar prescricoes',
      );
    }

    // Verify product if provided
    if (dto.productId) {
      const product = await this.prisma.cannabisProduct.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Produto nao encontrado');
      }
    }

    return this.prisma.prescription.create({
      data: {
        medicalRecordId: dto.medicalRecordId,
        patientId: medicalRecord.patientId,
        doctorId,
        productId: dto.productId,
        productName: dto.productName,
        concentration: dto.concentration,
        dosage: dto.dosage,
        quantity: dto.quantity,
        instructions: dto.instructions,
        validUntil: new Date(dto.validUntil),
        status: 'DRAFT',
      },
      include: {
        product: true,
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
  // FIND BY PATIENT
  // ============================================================================

  async findByPatient(
    patientId: string,
    organizationId: string,
    options: { status?: string; page?: number; limit?: number } = {},
  ) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify patient belongs to organization
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    const where: any = { patientId };
    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      prescriptions,
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
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        product: true,
        patient: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            cpfEncrypted: true,
            organizationId: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        medicalRecord: {
          include: {
            consultation: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescricao nao encontrada');
    }

    if (prescription.patient.organizationId !== organizationId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Decrypt CPF
    const decryptedPatient = {
      ...prescription.patient,
      cpf: this.cryptoUtil.decryptCpf(prescription.patient.cpfEncrypted),
      cpfEncrypted: undefined,
      organizationId: undefined,
    };

    return {
      ...prescription,
      patient: decryptedPatient,
    };
  }

  // ============================================================================
  // UPDATE PRESCRIPTION
  // ============================================================================

  async update(id: string, doctorId: string, dto: UpdatePrescriptionDto) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescricao nao encontrada');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode editar a prescricao',
      );
    }

    if (prescription.status === 'SIGNED') {
      throw new BadRequestException(
        'Prescricao assinada nao pode ser editada',
      );
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        ...dto,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
      include: {
        product: true,
      },
    });
  }

  // ============================================================================
  // SIGN PRESCRIPTION
  // ============================================================================

  async sign(id: string, doctorId: string, ipAddress: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescricao nao encontrada');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode assinar a prescricao',
      );
    }

    if (prescription.status === 'SIGNED') {
      throw new BadRequestException('Prescricao ja assinada');
    }

    // Generate signature hash
    const signedAt = new Date();
    const signaturePayload = {
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      doctorCrm: prescription.doctor.crm,
      doctorUfCrm: prescription.doctor.ufCrm,
      productName: prescription.productName,
      dosage: prescription.dosage,
      quantity: prescription.quantity,
      validUntil: prescription.validUntil,
    };

    const signatureHash = this.cryptoUtil.generateSignatureHash(
      signaturePayload,
      signedAt,
    );

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signatureHash,
        signedAt,
        signedByIp: ipAddress,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: prescription.doctor.userId,
        action: 'SIGN',
        entity: 'Prescription',
        entityId: prescription.id,
        metadata: {
          signatureHash,
          signedAt: signedAt.toISOString(),
        },
        ipAddress,
      },
    });

    return {
      ...updated,
      signatureHash,
    };
  }

  // ============================================================================
  // REVOKE PRESCRIPTION
  // ============================================================================

  async revoke(id: string, doctorId: string, reason: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescricao nao encontrada');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode revogar a prescricao',
      );
    }

    if (prescription.status === 'REVOKED') {
      throw new BadRequestException('Prescricao ja revogada');
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: 'REVOKED',
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: prescription.doctor.userId,
        action: 'UPDATE',
        entity: 'Prescription',
        entityId: prescription.id,
        metadata: {
          action: 'REVOKE',
          reason,
        },
      },
    });

    return updated;
  }

  // ============================================================================
  // GET CANNABIS PRODUCTS
  // ============================================================================

  async getProducts(search?: string, activeCompound?: string) {
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (activeCompound) {
      where.activeCompound = activeCompound;
    }

    return this.prisma.cannabisProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  // ============================================================================
  // GET PRODUCT BY ID
  // ============================================================================

  async getProductById(id: string) {
    const product = await this.prisma.cannabisProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return product;
  }
}
