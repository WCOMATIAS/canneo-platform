import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  appointmentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  productName: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  thcPercent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cbdPercent?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  dosage: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  durationDays?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  quantityText?: string;

  @IsBoolean()
  @IsOptional()
  sncrRequired?: boolean;
}

export class UpdatePrescriptionDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  productName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  thcPercent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cbdPercent?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  dosage?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  durationDays?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  quantityText?: string;

  @IsBoolean()
  @IsOptional()
  sncrRequired?: boolean;
}

export class PrescriptionResponseDto {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorCrm: string;
  patientId: string;
  patientName: string;
  status: string;
  productName: string;
  thcPercent: number | null;
  cbdPercent: number | null;
  dosage: string;
  durationDays: number | null;
  quantityText: string | null;
  sncrRequired: boolean;
  sncrNumber: string | null;
  sncrStatus: string | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SignPrescriptionDto {
  @IsString()
  @IsOptional()
  certificateId?: string; // ICP-Brasil certificate ID (for future implementation)
}

export class SignedPrescriptionResponseDto extends PrescriptionResponseDto {
  hashPre: string;
  hashPost: string;
  signedAt: Date;
}

export class SncrRegistrationResponseDto {
  prescriptionId: string;
  sncrNumber: string;
  sncrStatus: string;
  registeredAt: Date;
}
