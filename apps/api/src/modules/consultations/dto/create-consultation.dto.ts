import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ConsultationType } from '@prisma/client';

export class CreateConsultationDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsEnum(ConsultationType)
  type: ConsultationType;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @Max(180)
  @IsOptional()
  duration?: number; // minutes, default 60

  @IsString()
  @IsOptional()
  notes?: string;
}
