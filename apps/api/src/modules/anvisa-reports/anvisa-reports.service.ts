import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreateAnvisaReportDto, UpdateAnvisaReportDto } from './dto';

@Injectable()
export class AnvisaReportsService {
  constructor(
    private prisma: PrismaService,
    private cryptoUtil: CryptoUtil,
  ) {}

  // ============================================================================
  // CREATE ANVISA REPORT
  // ============================================================================

  async create(doctorId: string, dto: CreateAnvisaReportDto) {
    // Get medical record and verify ownership
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
      include: { consultation: true, patient: true },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    if (medicalRecord.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico do prontuario pode criar o laudo ANVISA',
      );
    }

    // Verify prescription if provided
    if (dto.prescriptionId) {
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: dto.prescriptionId,
          medicalRecordId: dto.medicalRecordId,
        },
      });
      if (!prescription) {
        throw new NotFoundException('Prescricao nao encontrada ou nao pertence ao prontuario');
      }
    }

    return this.prisma.anvisaReport.create({
      data: {
        medicalRecordId: dto.medicalRecordId,
        prescriptionId: dto.prescriptionId,
        patientId: medicalRecord.patientId,
        doctorId,
        formData: dto.formData as any,
        status: 'DRAFT',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        prescription: true,
      },
    });
  }

  // ============================================================================
  // AUTO-FILL FORM DATA FROM EXISTING RECORDS
  // ============================================================================

  async getAutoFillData(
    medicalRecordId: string,
    prescriptionId: string | undefined,
    doctorId: string,
  ) {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
        consultation: {
          include: { organization: true },
        },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuario nao encontrado');
    }

    // Decrypt patient CPF
    const patientCpf = this.cryptoUtil.decryptCpf(medicalRecord.patient.cpfEncrypted);

    // Get prescription data if provided
    let prescriptionData = null;
    if (prescriptionId) {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { product: true },
      });
      if (prescription) {
        prescriptionData = prescription;
      }
    }

    // Parse clinical data
    const clinicalData = medicalRecord.clinicalData as any;

    // Build auto-fill response
    return {
      patient: {
        name: medicalRecord.patient.name,
        cpf: patientCpf,
        birthDate: medicalRecord.patient.birthDate.toISOString().split('T')[0],
        nationality: 'Brasileira', // Default
        address: medicalRecord.patient.address || {},
        phone: medicalRecord.patient.phone || '',
        email: medicalRecord.patient.email || '',
      },
      doctor: {
        name: medicalRecord.doctor.user.name,
        crm: medicalRecord.doctor.crm,
        ufCrm: medicalRecord.doctor.ufCrm,
        specialty: medicalRecord.doctor.specialty || '',
        phone: medicalRecord.doctor.user.phone || '',
        email: medicalRecord.doctor.user.email,
        address: medicalRecord.consultation.organization.address || {},
      },
      diagnosis: {
        icd10Code: clinicalData?.primaryDiagnosis?.icd10Code || '',
        icd10Description: clinicalData?.primaryDiagnosis?.description || '',
        clinicalHistory: clinicalData?.historyOfPresentIllness || '',
        previousTreatments: clinicalData?.pastMedicalHistory || '',
        treatmentFailures: '',
        scientificEvidence: '',
        expectedBenefits: clinicalData?.cannabisRecommendation?.duration || '',
        potentialRisks: '',
      },
      prescription: prescriptionData
        ? {
            productName: prescriptionData.productName,
            manufacturer: prescriptionData.product?.manufacturer || '',
            composition: prescriptionData.product?.activeCompound || '',
            concentration: prescriptionData.concentration,
            presentation: prescriptionData.product?.presentation || '',
            administrationRoute:
              prescriptionData.product?.administrationRoute || '',
            dosage: prescriptionData.dosage,
            frequency: '',
            duration: '',
            quantity: prescriptionData.quantity,
          }
        : null,
      monitoring: {
        returnFrequency: '30 dias',
        evaluationParameters: [
          'Dor',
          'Qualidade do sono',
          'Funcionalidade',
          'Efeitos adversos',
        ],
        discontinuationCriteria: 'Ineficacia ou efeitos adversos graves',
      },
    };
  }

  // ============================================================================
  // FIND BY PATIENT
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

    return this.prisma.anvisaReport.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
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
    const report = await this.prisma.anvisaReport.findUnique({
      where: { id },
      include: {
        patient: true,
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
        prescription: {
          include: { product: true },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Laudo ANVISA nao encontrado');
    }

    if (report.patient.organizationId !== organizationId) {
      throw new ForbiddenException('Acesso negado');
    }

    return report;
  }

  // ============================================================================
  // UPDATE ANVISA REPORT
  // ============================================================================

  async update(id: string, doctorId: string, dto: UpdateAnvisaReportDto) {
    const report = await this.prisma.anvisaReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Laudo ANVISA nao encontrado');
    }

    if (report.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode editar o laudo',
      );
    }

    if (['SIGNED', 'SUBMITTED', 'APPROVED'].includes(report.status)) {
      throw new BadRequestException(
        'Laudo nao pode ser editado neste status',
      );
    }

    // Merge form data
    const currentFormData = report.formData as object;
    const updatedFormData = {
      ...currentFormData,
      ...dto.formData,
    };

    return this.prisma.anvisaReport.update({
      where: { id },
      data: {
        formData: updatedFormData as any,
      },
    });
  }

  // ============================================================================
  // SIGN ANVISA REPORT
  // ============================================================================

  async sign(id: string, doctorId: string, ipAddress: string) {
    const report = await this.prisma.anvisaReport.findUnique({
      where: { id },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Laudo ANVISA nao encontrado');
    }

    if (report.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Apenas o medico responsavel pode assinar o laudo',
      );
    }

    if (report.status !== 'DRAFT' && report.status !== 'PENDING_SIGNATURE') {
      throw new BadRequestException('Laudo nao pode ser assinado neste status');
    }

    // Validate required declarations
    const formData = report.formData as any;
    if (!formData.declarations?.consentObtained) {
      throw new BadRequestException(
        'Consentimento do paciente e obrigatorio',
      );
    }

    // Generate signature hash
    const signedAt = new Date();
    const signaturePayload = {
      reportId: report.id,
      patientId: report.patientId,
      doctorId: report.doctorId,
      doctorCrm: report.doctor.crm,
      doctorUfCrm: report.doctor.ufCrm,
      formData: report.formData,
    };

    const signatureHash = this.cryptoUtil.generateSignatureHash(
      signaturePayload,
      signedAt,
    );

    // Set expiration (1 year from signing)
    const expiresAt = new Date(signedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const updated = await this.prisma.anvisaReport.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signatureHash,
        signedAt,
        signedByIp: ipAddress,
        expiresAt,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: report.doctor.userId,
        action: 'SIGN',
        entity: 'AnvisaReport',
        entityId: report.id,
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
  // MARK AS SUBMITTED
  // ============================================================================

  async markAsSubmitted(
    id: string,
    doctorId: string,
    protocolNumber?: string,
  ) {
    const report = await this.prisma.anvisaReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Laudo ANVISA nao encontrado');
    }

    if (report.doctorId !== doctorId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (report.status !== 'SIGNED') {
      throw new BadRequestException(
        'Apenas laudos assinados podem ser marcados como submetidos',
      );
    }

    return this.prisma.anvisaReport.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        protocolNumber,
      },
    });
  }

  // ============================================================================
  // UPDATE STATUS (APPROVED/REJECTED)
  // ============================================================================

  async updateStatus(
    id: string,
    organizationId: string,
    status: 'APPROVED' | 'REJECTED',
    anvisaResponse?: any,
  ) {
    const report = await this.findById(id, organizationId);

    if (report.status !== 'SUBMITTED') {
      throw new BadRequestException(
        'Apenas laudos submetidos podem ter o status atualizado',
      );
    }

    // Update patient pipeline status if approved
    if (status === 'APPROVED') {
      await this.prisma.patient.update({
        where: { id: report.patientId },
        data: { pipelineStatus: 'APROVADO' },
      });
    }

    return this.prisma.anvisaReport.update({
      where: { id },
      data: {
        status,
        anvisaResponse,
      },
    });
  }

  // ============================================================================
  // GET CHECKLIST
  // ============================================================================

  async getChecklist(id: string, organizationId: string) {
    const report = await this.findById(id, organizationId);
    const formData = report.formData as any;

    return {
      laudoCompleto: this.isFormDataComplete(formData),
      prescricaoAssinada:
        report.prescription?.status === 'SIGNED' || false,
      tcleAssinado: formData.declarations?.consentObtained || false,
      documentosPaciente: await this.hasRequiredDocuments(report.patientId),
      crmVerificado: true, // Always true in MVP (manual verification)
      dadosCompletos: this.isFormDataComplete(formData),
      prontoParaSubmissao:
        report.status === 'SIGNED' &&
        this.isFormDataComplete(formData),
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private isFormDataComplete(formData: any): boolean {
    const required = [
      formData?.patient?.name,
      formData?.patient?.cpf,
      formData?.doctor?.crm,
      formData?.diagnosis?.icd10Code,
      formData?.prescription?.productName,
      formData?.declarations?.consentObtained,
    ];

    return required.every((field) => !!field);
  }

  private async hasRequiredDocuments(patientId: string): Promise<boolean> {
    const documents = await this.prisma.patientDocument.findMany({
      where: { patientId },
    });

    // Check for at least RG or CPF and proof of residence
    const hasIdentification = documents.some(
      (d) => d.type === 'RG' || d.type === 'CPF',
    );
    const hasResidence = documents.some(
      (d) => d.type === 'COMPROVANTE_RESIDENCIA',
    );

    return hasIdentification && hasResidence;
  }
}
