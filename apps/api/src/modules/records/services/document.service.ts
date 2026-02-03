import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { UserRole } from '@prisma/client';
import {
  CreateDocumentDto,
  DocumentResponseDto,
  RequestUploadUrlDto,
  UploadUrlResponseDto,
  SignedUrlResponseDto,
  ConfirmUploadDto,
} from '../dto/document.dto';
import {
  SIGNED_URL_TTL_SECONDS,
  STORAGE_FOLDERS,
  ALLOWED_MIME_TYPES,
} from '../constants/records.constants';
import { MedicalRecordService } from './medical-record.service';

interface CurrentUser {
  userId: string;
  role: UserRole;
  doctorId?: string;
  patientId?: string;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly medicalRecordService: MedicalRecordService,
  ) {}

  /**
   * Request a signed URL for uploading a document
   */
  async requestUploadUrl(
    patientId: string,
    dto: RequestUploadUrlDto,
    currentUser: CurrentUser,
  ): Promise<UploadUrlResponseDto> {
    // Only doctors can upload documents
    if (currentUser.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only doctors can upload documents');
    }

    // Validate content type
    if (!ALLOWED_MIME_TYPES.includes(dto.contentType as any)) {
      throw new BadRequestException(
        `Invalid content type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Generate unique key
    const key = this.storageService.generateKey(STORAGE_FOLDERS.DOCUMENTS, dto.filename);

    // Get signed upload URL (15 minutes)
    const uploadUrl = await this.storageService.getSignedUploadUrl(key, dto.contentType, {
      expiresIn: 900,
    });

    this.logger.log(`Generated upload URL for patient ${patientId}, key: ${key}`);

    return {
      uploadUrl,
      key,
      expiresIn: 900,
    };
  }

  /**
   * Confirm document upload and create database record
   */
  async confirmUpload(
    patientId: string,
    dto: ConfirmUploadDto & CreateDocumentDto,
    currentUser: CurrentUser,
  ): Promise<DocumentResponseDto> {
    // Only doctors can upload documents
    if (currentUser.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only doctors can upload documents');
    }

    // Get or create medical record
    const medicalRecordId = await this.medicalRecordService.getOrCreateMedicalRecord(patientId);

    // Construct the file URL
    const fileUrl = `s3://${dto.key}`;

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        medicalRecordId,
        appointmentId: dto.appointmentId,
        type: dto.type,
        fileUrl,
      },
      include: {
        signedByUser: { select: { fullName: true } },
      },
    });

    this.logger.log(
      `Document ${document.id} created for patient ${patientId} by user ${currentUser.userId}`,
    );

    return this.mapToResponse(document);
  }

  /**
   * Get a signed URL for downloading a document
   */
  async getSignedUrl(
    documentId: string,
    currentUser: CurrentUser,
  ): Promise<SignedUrlResponseDto> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        medicalRecord: true,
        prescription: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Verify access
    await this.verifyDocumentAccess(document, currentUser);

    // Extract key from fileUrl
    const key = this.extractKeyFromFileUrl(document.fileUrl);
    if (!key) {
      throw new BadRequestException('Invalid document file URL');
    }

    // Generate signed URL
    const url = await this.storageService.getSignedDownloadUrl(key, {
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });

    this.logger.debug(`Generated signed URL for document ${documentId}`);

    return {
      url,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    };
  }

  /**
   * Get all documents for a patient
   */
  async getPatientDocuments(
    patientId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 20,
  ): Promise<{ documents: DocumentResponseDto[]; total: number; hasMore: boolean }> {
    await this.verifyPatientAccess(patientId, currentUser);

    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { patientId },
    });

    if (!medicalRecord) {
      return { documents: [], total: 0, hasMore: false };
    }

    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: { medicalRecordId: medicalRecord.id },
        include: {
          signedByUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({
        where: { medicalRecordId: medicalRecord.id },
      }),
    ]);

    return {
      documents: documents.map((doc) => this.mapToResponse(doc)),
      total,
      hasMore: skip + documents.length < total,
    };
  }

  /**
   * Get a single document by ID
   */
  async getDocument(
    documentId: string,
    currentUser: CurrentUser,
  ): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        medicalRecord: true,
        signedByUser: { select: { fullName: true } },
        prescription: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.verifyDocumentAccess(document, currentUser);

    return this.mapToResponse(document);
  }

  /**
   * Extract S3 key from file URL (supports s3:// protocol or full URL)
   */
  private extractKeyFromFileUrl(fileUrl: string): string | null {
    if (fileUrl.startsWith('s3://')) {
      return fileUrl.substring(5);
    }
    return this.storageService.extractKeyFromUrl(fileUrl);
  }

  /**
   * Verify user has access to a document
   */
  private async verifyDocumentAccess(
    document: any,
    currentUser: CurrentUser,
  ): Promise<void> {
    // Admin always has access
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Get patient ID from document
    let patientId: string | null = null;

    if (document.medicalRecord) {
      patientId = document.medicalRecord.patientId;
    } else if (document.prescription) {
      patientId = document.prescription.patientId;
    }

    if (!patientId) {
      throw new ForbiddenException('Access denied');
    }

    await this.verifyPatientAccess(patientId, currentUser);
  }

  /**
   * Verify user has access to a patient's records
   */
  private async verifyPatientAccess(
    patientId: string,
    currentUser: CurrentUser,
  ): Promise<void> {
    // Admin always has access
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Patient can only access their own documents
    if (currentUser.role === UserRole.PATIENT) {
      if (currentUser.patientId !== patientId) {
        throw new ForbiddenException('You can only access your own documents');
      }
      return;
    }

    // Doctor can access documents of patients they have appointments with
    if (currentUser.role === UserRole.DOCTOR && currentUser.doctorId) {
      const hasAppointment = await this.prisma.appointment.findFirst({
        where: {
          doctorId: currentUser.doctorId,
          patientId,
        },
      });

      if (!hasAppointment) {
        throw new ForbiddenException(
          'You can only access documents of patients you have appointments with',
        );
      }
      return;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Map document entity to response DTO
   */
  private mapToResponse(document: any): DocumentResponseDto {
    return {
      id: document.id,
      medicalRecordId: document.medicalRecordId,
      appointmentId: document.appointmentId,
      prescriptionId: document.prescriptionId,
      type: document.type,
      fileUrl: document.fileUrl,
      hashPre: document.hashPre,
      hashPost: document.hashPost,
      signedByUserId: document.signedByUserId,
      signedByUserName: document.signedByUser?.fullName || null,
      signedAt: document.signedAt,
      createdAt: document.createdAt,
    };
  }
}
