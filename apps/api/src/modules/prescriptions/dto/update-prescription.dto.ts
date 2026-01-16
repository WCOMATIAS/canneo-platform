import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';

export class UpdatePrescriptionDto extends PartialType(
  OmitType(CreatePrescriptionDto, ['medicalRecordId'] as const),
) {}
