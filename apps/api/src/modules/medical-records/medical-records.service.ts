import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private prisma: PrismaService,
    private cryptoUtil: CryptoUtil,
  ) {}

  // ============================================================================
  // CREATE MEDICAL RECORD
  // ============================================================================

  async create(doctorId: string, dto: CreateMedicalRecordDto) {
    // Get consultation and verify ownership
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: dto.consultationId },
      include: { patient: true },
    });

    if (!consultation) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico da consulta pode criar o prontuario',
      );
    }

    // Check if medical record already exists for this consultation
    const existing = await this.prisma.medicalRecord.findFirst({
      where: { consultationId: dto.consultationId },
    });

    if (existing) {
      throw new BadRequestException(
        'Ja existe um prontuario para esta consulta',
      );
    }

    return this.prisma.medicalRecord.create({
      data: {
        consultationId: dto.consultationId,
        patientId: consultation.patientId,
        doctorId,
        templateType: dto.templateType,
        clinicalData: dto.clinicalData,
        status: 'DRAFT',
      },
      include: {
        consultation: {
          select: {
            scheduledAt: true,
            type: true,
          },
        },
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
  // FIND ALL BY PATIENT
  // ============================================================================

  async findByPatient(patientId: string, organizationId: string) {
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

    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        consultation: {
          select: {
            scheduledAt: true,
            type: true,
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
  // FIND BY ID
  // ============================================================================

  async findById(id: string, organizationId: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            organization: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
            allergies: true,
            conditions: true,
            medications: true,
            cpfEncrypted: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        prescriptions: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    if (record.consultation.organizationId !== organizationId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Decrypt CPF for display
    const decryptedPatient = {
      ...record.patient,
      cpf: this.cryptoUtil.decryptCpf(record.patient.cpfEncrypted),
      cpfEncrypted: undefined,
    };

    return {
      ...record,
      patient: decryptedPatient,
    };
  }

  // ============================================================================
  // UPDATE MEDICAL RECORD
  // ============================================================================

  async update(id: string, doctorId: string, dto: UpdateMedicalRecordDto) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    if (record.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode editar o prontuario',
      );
    }

    if (record.status === 'SIGNED') {
      throw new BadRequestException(
        'Prontuario ja assinado nao pode ser editado',
      );
    }

    // Merge clinical data
    const updatedClinicalData = {
      ...(record.clinicalData as object),
      ...dto.clinicalData,
    };

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        clinicalData: updatedClinicalData,
      },
    });
  }

  // ============================================================================
  // SIGN MEDICAL RECORD
  // ============================================================================

  async sign(id: string, doctorId: string, ipAddress: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    if (record.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode assinar o prontuario',
      );
    }

    if (record.status === 'SIGNED') {
      throw new BadRequestException('Prontuario ja assinado');
    }

    // Generate signature hash
    const signedAt = new Date();
    const signaturePayload = {
      recordId: record.id,
      patientId: record.patientId,
      doctorId: record.doctorId,
      doctorCrm: record.doctor.crm,
      doctorUfCrm: record.doctor.ufCrm,
      clinicalData: record.clinicalData,
    };

    const signatureHash = this.cryptoUtil.generateSignatureHash(
      signaturePayload,
      signedAt,
    );

    const updated = await this.prisma.medicalRecord.update({
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
        userId: record.doctor.userId,
        action: 'SIGN',
        entity: 'MedicalRecord',
        entityId: record.id,
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
  // GET TEMPLATE STRUCTURE
  // ============================================================================

  getTemplateStructure(templateType: string) {
    const templates = {
      PRIMEIRA_CONSULTA: {
        sections: [
          {
            id: 'chief_complaint',
            title: 'Queixa Principal',
            fields: ['chiefComplaint', 'historyOfPresentIllness'],
          },
          {
            id: 'history',
            title: 'Historia Medica',
            fields: [
              'pastMedicalHistory',
              'familyHistory',
              'socialHistory',
              'currentMedications',
              'allergies',
            ],
          },
          {
            id: 'cannabis_history',
            title: 'Experiencia com Cannabis',
            fields: ['previousCannabisUse', 'previousCannabisExperience'],
          },
          {
            id: 'physical_exam',
            title: 'Exame Fisico',
            fields: ['vitalSigns', 'physicalExam'],
          },
          {
            id: 'diagnosis',
            title: 'Diagnostico',
            fields: ['primaryDiagnosis', 'secondaryDiagnoses'],
          },
          {
            id: 'treatment',
            title: 'Plano de Tratamento',
            fields: ['treatmentPlan', 'cannabisRecommendation'],
          },
          {
            id: 'follow_up',
            title: 'Acompanhamento',
            fields: ['followUpInstructions', 'nextAppointment'],
          },
        ],
      },
      RETORNO: {
        sections: [
          {
            id: 'treatment_response',
            title: 'Resposta ao Tratamento',
            fields: ['treatmentResponse', 'effectiveness'],
          },
          {
            id: 'quality_metrics',
            title: 'Metricas de Qualidade de Vida',
            fields: ['qualityOfLife', 'painLevel', 'sleepQuality'],
          },
          {
            id: 'side_effects',
            title: 'Efeitos Colaterais',
            fields: ['sideEffects'],
          },
          {
            id: 'physical_exam',
            title: 'Exame Fisico',
            fields: ['vitalSigns', 'physicalExam'],
          },
          {
            id: 'adjustment',
            title: 'Ajustes',
            fields: ['currentDose', 'newDose', 'adjustmentReason'],
          },
          {
            id: 'follow_up',
            title: 'Proximo Retorno',
            fields: ['followUpInstructions', 'nextAppointment'],
          },
        ],
      },
      AJUSTE_DOSE: {
        sections: [
          {
            id: 'current_status',
            title: 'Situacao Atual',
            fields: ['currentDose', 'effectiveness', 'sideEffects'],
          },
          {
            id: 'adjustment',
            title: 'Ajuste de Dose',
            fields: ['newDose', 'adjustmentReason'],
          },
          {
            id: 'quality_metrics',
            title: 'Metricas',
            fields: ['painLevel', 'sleepQuality', 'qualityOfLife'],
          },
          {
            id: 'notes',
            title: 'Observacoes',
            fields: ['notes', 'followUpInstructions'],
          },
        ],
      },
    };

    return templates[templateType] || null;
  }
}
