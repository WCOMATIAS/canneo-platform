import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { AnvisaFormDataDto } from './create-anvisa-report.dto';

class PartialAnvisaFormDataDto extends PartialType(AnvisaFormDataDto) {}

export class UpdateAnvisaReportDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PartialAnvisaFormDataDto)
  @IsOptional()
  formData?: Partial<AnvisaFormDataDto>;
}
