import { IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicalDataDto } from './create-medical-record.dto';

export class UpdateMedicalRecordDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ClinicalDataDto)
  @IsOptional()
  clinicalData?: Partial<ClinicalDataDto>;
}
