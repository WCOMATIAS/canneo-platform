import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import {
  CreateRecordEntryDto,
  MedicalRecordResponseDto,
  RecordEntryResponseDto,
  PaginatedRecordEntriesDto,
} from '../dto/record-entry.dto';

interface CurrentUser {
  userId: string;
  role: UserRole;
  doctorId?: string;
  patientId?: string;
}

@Injectable()
export class MedicalRecordService {
  private readonly logger = new Logger(MedicalRecordService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a medical record for a patient
   */
  async getOrCreateMedicalRecord(patientId: string): Promise<string> {
    let record = await this.prisma.medicalRecord.findUnique({
      where: { patientId },
    });

    if (!record) {
      record = await this.prisma.medicalRecord.create({
        data: { patientId },
      });
      this.logger.log(`Created medical record for patient ${patientId}`);
    }

    return record.id;
  }

  /**
   * Get a patient's medical record with entries
   */
  async getPatientRecord(
    patientId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 50,
  ): Promise<MedicalRecordResponseDto> {
    // Authorization check
    await this.verifyAccess(patientId, currentUser);

    // Get patient info
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { fullName: true } },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get or create medical record
    const medicalRecordId = await this.getOrCreateMedicalRecord(patientId);

    // Get entries with pagination
    const skip = (page - 1) * limit;
    const [entries, documentsCount] = await Promise.all([
      this.prisma.recordEntry.findMany({
        where: { medicalRecordId },
        include: {
          authorUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({
        where: { medicalRecordId },
      }),
    ]);

    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
    });

    return {
      id: medicalRecordId,
      patientId,
      patientName: patient.user.fullName,
      createdAt: record!.createdAt,
      updatedAt: record!.updatedAt,
      entries: entries.map((entry) => ({
        id: entry.id,
        medicalRecordId: entry.medicalRecordId,
        authorUserId: entry.authorUserId,
        authorName: entry.authorUser.fullName,
        type: entry.type,
        content: entry.content,
        createdAt: entry.createdAt,
      })),
      documentsCount,
    };
  }

  /**
   * Add an entry to a patient's medical record
   */
  async createRecordEntry(
    patientId: string,
    dto: CreateRecordEntryDto,
    currentUser: CurrentUser,
  ): Promise<RecordEntryResponseDto> {
    // Only doctors can create entries
    if (currentUser.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only doctors can create medical record entries');
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get or create medical record
    const medicalRecordId = await this.getOrCreateMedicalRecord(patientId);

    // Create entry
    const entry = await this.prisma.recordEntry.create({
      data: {
        medicalRecordId,
        authorUserId: currentUser.userId,
        type: dto.type || 'EVOLUTION',
        content: dto.content,
      },
      include: {
        authorUser: { select: { fullName: true } },
      },
    });

    this.logger.log(
      `Created record entry ${entry.id} for patient ${patientId} by user ${currentUser.userId}`,
    );

    return {
      id: entry.id,
      medicalRecordId: entry.medicalRecordId,
      authorUserId: entry.authorUserId,
      authorName: entry.authorUser.fullName,
      type: entry.type,
      content: entry.content,
      createdAt: entry.createdAt,
    };
  }

  /**
   * Get paginated entries for a patient's medical record
   */
  async getRecordEntries(
    patientId: string,
    currentUser: CurrentUser,
    page = 1,
    limit = 20,
  ): Promise<PaginatedRecordEntriesDto> {
    await this.verifyAccess(patientId, currentUser);

    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { patientId },
    });

    if (!medicalRecord) {
      return {
        entries: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      this.prisma.recordEntry.findMany({
        where: { medicalRecordId: medicalRecord.id },
        include: {
          authorUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.recordEntry.count({
        where: { medicalRecordId: medicalRecord.id },
      }),
    ]);

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        medicalRecordId: entry.medicalRecordId,
        authorUserId: entry.authorUserId,
        authorName: entry.authorUser.fullName,
        type: entry.type,
        content: entry.content,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      limit,
      hasMore: skip + entries.length < total,
    };
  }

  /**
   * Verify that the current user has access to the patient's record
   */
  private async verifyAccess(patientId: string, currentUser: CurrentUser): Promise<void> {
    // Admin always has access
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Patient can only access their own record
    if (currentUser.role === UserRole.PATIENT) {
      if (currentUser.patientId !== patientId) {
        throw new ForbiddenException('You can only access your own medical record');
      }
      return;
    }

    // Doctor can access records of patients they have appointments with
    if (currentUser.role === UserRole.DOCTOR && currentUser.doctorId) {
      const hasAppointment = await this.prisma.appointment.findFirst({
        where: {
          doctorId: currentUser.doctorId,
          patientId,
        },
      });

      if (!hasAppointment) {
        throw new ForbiddenException(
          'You can only access records of patients you have appointments with',
        );
      }
      return;
    }

    throw new ForbiddenException('Access denied');
  }
}
