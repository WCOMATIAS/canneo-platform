import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RECORD_ENTRY_TYPES, RecordEntryType } from '../constants/records.constants';

export class CreateRecordEntryDto {
  @IsEnum(RECORD_ENTRY_TYPES, {
    message: `type must be one of: ${Object.values(RECORD_ENTRY_TYPES).join(', ')}`,
  })
  @IsOptional()
  type?: RecordEntryType = RECORD_ENTRY_TYPES.EVOLUTION;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  @MaxLength(50000, { message: 'Content must not exceed 50000 characters' })
  content: string;
}

export class RecordEntryResponseDto {
  id: string;
  medicalRecordId: string;
  authorUserId: string;
  authorName: string;
  type: string;
  content: string;
  createdAt: Date;
}

export class MedicalRecordResponseDto {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: Date;
  updatedAt: Date;
  entries: RecordEntryResponseDto[];
  documentsCount: number;
}

export class PaginatedRecordEntriesDto {
  entries: RecordEntryResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
