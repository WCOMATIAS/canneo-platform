import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { MedicalRecordService } from './services/medical-record.service';
import { DocumentService } from './services/document.service';
import {
  CreateRecordEntryDto,
  MedicalRecordResponseDto,
  RecordEntryResponseDto,
  PaginatedRecordEntriesDto,
} from './dto/record-entry.dto';
import {
  RequestUploadUrlDto,
  UploadUrlResponseDto,
  SignedUrlResponseDto,
  ConfirmUploadDto,
  CreateDocumentDto,
  DocumentResponseDto,
} from './dto/document.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  doctorId?: string;
  patientId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordsController {
  constructor(
    private readonly medicalRecordService: MedicalRecordService,
    private readonly documentService: DocumentService,
  ) {}

  // ========================
  // Medical Records
  // ========================

  /**
   * GET /patients/:id/record
   * Get a patient's medical record with recent entries
   */
  @Get('patients/:id/record')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getPatientRecord(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordService.getPatientRecord(
      patientId,
      {
        userId: user.sub,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      page,
      Math.min(limit, 100),
    );
  }

  /**
   * GET /patients/:id/record/entries
   * Get paginated entries for a patient's medical record
   */
  @Get('patients/:id/record/entries')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getRecordEntries(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedRecordEntriesDto> {
    return this.medicalRecordService.getRecordEntries(
      patientId,
      {
        userId: user.sub,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      page,
      Math.min(limit, 100),
    );
  }

  /**
   * POST /patients/:id/record/entries
   * Add an entry to a patient's medical record
   */
  @Post('patients/:id/record/entries')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async createRecordEntry(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateRecordEntryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<RecordEntryResponseDto> {
    return this.medicalRecordService.createRecordEntry(patientId, dto, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  // ========================
  // Documents
  // ========================

  /**
   * GET /patients/:id/documents
   * Get all documents for a patient
   */
  @Get('patients/:id/documents')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getPatientDocuments(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ documents: DocumentResponseDto[]; total: number; hasMore: boolean }> {
    return this.documentService.getPatientDocuments(
      patientId,
      {
        userId: user.sub,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      page,
      Math.min(limit, 100),
    );
  }

  /**
   * POST /patients/:id/documents/upload-url
   * Request a signed URL for uploading a document
   */
  @Post('patients/:id/documents/upload-url')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async requestUploadUrl(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Body() dto: RequestUploadUrlDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UploadUrlResponseDto> {
    return this.documentService.requestUploadUrl(patientId, dto, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * POST /patients/:id/documents
   * Confirm document upload and create database record
   */
  @Post('patients/:id/documents')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async confirmUpload(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Body() dto: ConfirmUploadDto & CreateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentResponseDto> {
    return this.documentService.confirmUpload(patientId, dto, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * GET /documents/:id
   * Get a document by ID
   */
  @Get('documents/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentResponseDto> {
    return this.documentService.getDocument(documentId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }

  /**
   * GET /documents/:id/signed-url
   * Get a signed URL for downloading a document (TTL: 5 minutes)
   */
  @Get('documents/:id/signed-url')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getSignedUrl(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SignedUrlResponseDto> {
    return this.documentService.getSignedUrl(documentId, {
      userId: user.sub,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
    });
  }
}
