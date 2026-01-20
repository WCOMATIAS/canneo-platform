import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PatientPortalService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // ============================================================================
  // FIND PATIENT BY USER
  // ============================================================================

  async findPatientByUser(userId: string, organizationId: string) {
    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    // Find patient by email in the organization
    const patient = await this.prisma.patient.findFirst({
      where: {
        organizationId,
        email: user.email,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(
        'Perfil de paciente nao encontrado. Entre em contato com a clinica.',
      );
    }

    return patient;
  }

  // ============================================================================
  // GET PATIENT PROFILE
  // ============================================================================

  async getProfile(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      allergies: patient.allergies,
      conditions: patient.conditions,
      medications: patient.medications,
      pipelineStatus: patient.pipelineStatus,
      organization: patient.organization,
    };
  }

  // ============================================================================
  // GET CONSULTATIONS
  // ============================================================================

  async getConsultations(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    const consultations = await this.prisma.consultation.findMany({
      where: {
        patientId: patient.id,
        organizationId,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return {
      consultations: consultations.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        scheduledAt: c.scheduledAt,
        duration: c.duration,
        startedAt: c.startedAt,
        endedAt: c.endedAt,
        dailyRoomUrl: c.dailyRoomUrl,
        notes: c.notes,
        doctor: {
          id: c.doctorId,
          name: c.doctor.user.name,
          avatarUrl: c.doctor.user.avatarUrl,
          specialty: c.doctor.specialty,
          crm: c.doctor.crm,
          ufCrm: c.doctor.ufCrm,
        },
      })),
      upcoming: consultations.filter(
        (c) =>
          ['SCHEDULED', 'CONFIRMED'].includes(c.status) &&
          new Date(c.scheduledAt) > new Date(),
      ).length,
      completed: consultations.filter((c) => c.status === 'COMPLETED').length,
    };
  }

  // ============================================================================
  // GET PRESCRIPTIONS
  // ============================================================================

  async getPrescriptions(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return {
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        productName: p.productName,
        concentration: p.concentration,
        dosage: p.dosage,
        quantity: p.quantity,
        instructions: p.instructions,
        validUntil: p.validUntil,
        status: p.status,
        pdfUrl: p.pdfUrl,
        signedAt: p.signedAt,
        createdAt: p.createdAt,
        isActive: p.status === 'SIGNED' && new Date(p.validUntil) > now,
        isExpired: new Date(p.validUntil) <= now,
        doctor: {
          id: p.doctorId,
          name: p.doctor.user.name,
          crm: p.doctor.crm,
          ufCrm: p.doctor.ufCrm,
        },
        product: p.product
          ? {
              id: p.product.id,
              name: p.product.name,
              manufacturer: p.product.manufacturer,
              activeCompound: p.product.activeCompound,
            }
          : null,
      })),
      active: prescriptions.filter(
        (p) => p.status === 'SIGNED' && new Date(p.validUntil) > now,
      ).length,
      expired: prescriptions.filter((p) => new Date(p.validUntil) <= now)
        .length,
    };
  }

  // ============================================================================
  // GET DOCUMENTS
  // ============================================================================

  async getDocuments(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    const documents = await this.prisma.patientDocument.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Define required document types for ANVISA
    const requiredTypes = [
      { type: 'RG', label: 'RG ou CNH', required: true },
      { type: 'CPF', label: 'CPF', required: true },
      { type: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residencia', required: true },
      { type: 'LAUDO_ANTERIOR', label: 'Exames/Laudos Anteriores', required: false },
    ];

    // Map documents by type
    const documentsByType: Record<string, any> = {};
    documents.forEach((doc) => {
      if (!documentsByType[doc.type]) {
        documentsByType[doc.type] = [];
      }
      documentsByType[doc.type].push(doc);
    });

    // Build response with required documents status
    const requiredDocuments = requiredTypes.map((rt) => ({
      type: rt.type,
      label: rt.label,
      required: rt.required,
      uploaded: documentsByType[rt.type]?.length > 0,
      documents: documentsByType[rt.type] || [],
    }));

    return {
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        url: d.url,
        mimeType: d.mimeType,
        size: d.size,
        uploadedAt: d.uploadedAt,
      })),
      requiredDocuments,
      totalUploaded: documents.length,
      requiredMissing: requiredDocuments.filter(
        (r) => r.required && !r.uploaded,
      ).length,
    };
  }

  // ============================================================================
  // UPLOAD DOCUMENT
  // ============================================================================

  async uploadDocument(
    userId: string,
    organizationId: string,
    file: Express.Multer.File,
    documentType: string,
  ) {
    const patient = await this.findPatientByUser(userId, organizationId);

    // Validate document type
    const validTypes = [
      'RG',
      'CPF',
      'COMPROVANTE_RESIDENCIA',
      'LAUDO_ANTERIOR',
      'OUTROS',
    ];
    if (!validTypes.includes(documentType)) {
      throw new BadRequestException('Tipo de documento invalido');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Maximo: 10MB');
    }

    // Validate mime type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo nao permitido. Use JPG, PNG ou PDF.',
      );
    }

    // Upload to storage
    const { url, path } = await this.storageService.uploadPatientDocument(
      patient.id,
      file.buffer,
      file.originalname,
      file.mimetype,
      documentType,
    );

    // Save to database
    const document = await this.prisma.patientDocument.create({
      data: {
        patientId: patient.id,
        name: file.originalname,
        type: documentType,
        url,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return {
      id: document.id,
      name: document.name,
      type: document.type,
      url: document.url,
      mimeType: document.mimeType,
      size: document.size,
      uploadedAt: document.uploadedAt,
    };
  }

  // ============================================================================
  // DELETE DOCUMENT
  // ============================================================================

  async deleteDocument(
    userId: string,
    organizationId: string,
    documentId: string,
  ) {
    const patient = await this.findPatientByUser(userId, organizationId);

    const document = await this.prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        patientId: patient.id,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento nao encontrado');
    }

    // Delete from storage
    try {
      await this.storageService.deleteFile(document.url);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
    }

    // Delete from database
    await this.prisma.patientDocument.delete({
      where: { id: documentId },
    });

    return { success: true };
  }

  // ============================================================================
  // GET ANVISA REPORTS
  // ============================================================================

  async getAnvisaReports(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    const reports = await this.prisma.anvisaReport.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        prescription: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reports: reports.map((r) => ({
        id: r.id,
        status: r.status,
        pdfUrl: r.pdfUrl,
        packageUrl: r.packageUrl,
        protocolNumber: r.protocolNumber,
        submittedAt: r.submittedAt,
        expiresAt: r.expiresAt,
        signedAt: r.signedAt,
        createdAt: r.createdAt,
        doctor: {
          id: r.doctorId,
          name: r.doctor.user.name,
          crm: r.doctor.crm,
          ufCrm: r.doctor.ufCrm,
        },
        prescription: r.prescription
          ? {
              id: r.prescription.id,
              productName: r.prescription.productName,
            }
          : null,
      })),
      pending: reports.filter((r) =>
        ['DRAFT', 'PENDING_SIGNATURE', 'SIGNED'].includes(r.status),
      ).length,
      approved: reports.filter((r) => r.status === 'APPROVED').length,
    };
  }

  // ============================================================================
  // GET DASHBOARD SUMMARY
  // ============================================================================

  async getDashboardSummary(userId: string, organizationId: string) {
    const patient = await this.findPatientByUser(userId, organizationId);

    // Get next consultation
    const nextConsultation = await this.prisma.consultation.findFirst({
      where: {
        patientId: patient.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gt: new Date() },
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Get active prescriptions count
    const activePrescriptions = await this.prisma.prescription.count({
      where: {
        patientId: patient.id,
        status: 'SIGNED',
        validUntil: { gt: new Date() },
      },
    });

    // Get pending documents
    const documents = await this.prisma.patientDocument.findMany({
      where: { patientId: patient.id },
      select: { type: true },
    });

    const uploadedTypes = new Set(documents.map((d) => d.type));
    const requiredTypes = ['RG', 'CPF', 'COMPROVANTE_RESIDENCIA'];
    const pendingDocuments = requiredTypes.filter(
      (t) => !uploadedTypes.has(t),
    ).length;

    // Get ANVISA report status
    const latestAnvisaReport = await this.prisma.anvisaReport.findFirst({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      select: { status: true, expiresAt: true },
    });

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        pipelineStatus: patient.pipelineStatus,
      },
      nextConsultation: nextConsultation
        ? {
            id: nextConsultation.id,
            type: nextConsultation.type,
            status: nextConsultation.status,
            scheduledAt: nextConsultation.scheduledAt,
            duration: nextConsultation.duration,
            dailyRoomUrl: nextConsultation.dailyRoomUrl,
            doctor: {
              name: nextConsultation.doctor.user.name,
              avatarUrl: nextConsultation.doctor.user.avatarUrl,
              specialty: nextConsultation.doctor.specialty,
            },
          }
        : null,
      stats: {
        activePrescriptions,
        pendingDocuments,
        anvisaStatus: latestAnvisaReport?.status || null,
        anvisaExpires: latestAnvisaReport?.expiresAt || null,
      },
      organization: patient.organization,
    };
  }
}
