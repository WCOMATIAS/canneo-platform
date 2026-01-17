import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultationDto } from './create-consultation.dto';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ConsultationStatus } from '@prisma/client';

export class UpdateConsultationDto extends PartialType(CreateConsultationDto) {
  @IsEnum(ConsultationStatus)
  @IsOptional()
  status?: ConsultationStatus;

  @IsString()
  @IsOptional()
  cancelReason?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
