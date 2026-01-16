import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  concentration: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  @IsNotEmpty()
  validUntil: string;
}
