import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DOCUMENT_TYPES, DocumentType, ALLOWED_MIME_TYPES } from '../constants/records.constants';

export class CreateDocumentDto {
  @IsEnum(DOCUMENT_TYPES, {
    message: `type must be one of: ${Object.values(DOCUMENT_TYPES).join(', ')}`,
  })
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;
}

export class RequestUploadUrlDto {
  @IsEnum(DOCUMENT_TYPES, {
    message: `type must be one of: ${Object.values(DOCUMENT_TYPES).join(', ')}`,
  })
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsEnum(ALLOWED_MIME_TYPES, {
    message: `contentType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  })
  contentType: string;
}

export class UploadUrlResponseDto {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export class DocumentResponseDto {
  id: string;
  medicalRecordId: string | null;
  appointmentId: string | null;
  prescriptionId: string | null;
  type: string;
  fileUrl: string;
  hashPre: string | null;
  hashPost: string | null;
  signedByUserId: string | null;
  signedByUserName: string | null;
  signedAt: Date | null;
  createdAt: Date;
}

export class SignedUrlResponseDto {
  url: string;
  expiresIn: number;
}

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
