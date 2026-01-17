import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdatePrescriptionDto extends PartialType(
  OmitType(CreatePrescriptionDto, ['medicalRecordId'] as const),
) {
  @IsDateString()
  @IsOptional()
  validUntil?: string;
}
