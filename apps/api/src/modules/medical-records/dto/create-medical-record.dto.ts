import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsObject,
  ValidateNested,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedicalRecordTemplate } from '@prisma/client';

// ============================================================================
// VITAL SIGNS
// ============================================================================

class VitalSignsDto {
  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;
}

// ============================================================================
// DIAGNOSIS ENTRY
// ============================================================================

class DiagnosisEntryDto {
  @IsString()
  @IsNotEmpty()
  icd10Code: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// ============================================================================
// CANNABIS RECOMMENDATION
// ============================================================================

class CannabisRecommendationDto {
  @IsString()
  @IsNotEmpty()
  productType: string;

  @IsString()
  @IsNotEmpty()
  concentration: string;

  @IsString()
  @IsNotEmpty()
  administration: string;

  @IsString()
  @IsNotEmpty()
  startingDose: string;

  @IsString()
  @IsNotEmpty()
  titration: string;

  @IsString()
  @IsNotEmpty()
  duration: string;
}

// ============================================================================
// CLINICAL DATA
// ============================================================================

export class ClinicalDataDto {
  // Common fields
  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @IsString()
  @IsOptional()
  historyOfPresentIllness?: string;

  // Medical history
  @IsString()
  @IsOptional()
  pastMedicalHistory?: string;

  @IsString()
  @IsOptional()
  familyHistory?: string;

  @IsString()
  @IsOptional()
  socialHistory?: string;

  // Cannabis specific
  @IsBoolean()
  @IsOptional()
  previousCannabisUse?: boolean;

  @IsString()
  @IsOptional()
  previousCannabisExperience?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  // Physical exam
  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsOptional()
  vitalSigns?: VitalSignsDto;

  @IsString()
  @IsOptional()
  physicalExam?: string;

  // Diagnosis
  @ValidateNested()
  @Type(() => DiagnosisEntryDto)
  @IsOptional()
  primaryDiagnosis?: DiagnosisEntryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisEntryDto)
  @IsOptional()
  secondaryDiagnoses?: DiagnosisEntryDto[];

  // Treatment plan
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ValidateNested()
  @Type(() => CannabisRecommendationDto)
  @IsOptional()
  cannabisRecommendation?: CannabisRecommendationDto;

  // Follow-up
  @IsString()
  @IsOptional()
  followUpInstructions?: string;

  @IsString()
  @IsOptional()
  nextAppointment?: string;

  // For AJUSTE_DOSE template
  @IsString()
  @IsOptional()
  currentDose?: string;

  @IsString()
  @IsOptional()
  newDose?: string;

  @IsString()
  @IsOptional()
  adjustmentReason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sideEffects?: string[];

  @IsNumber()
  @IsOptional()
  effectiveness?: number;

  // For RETORNO template
  @IsString()
  @IsOptional()
  treatmentResponse?: string;

  @IsNumber()
  @IsOptional()
  qualityOfLife?: number;

  @IsNumber()
  @IsOptional()
  painLevel?: number;

  @IsNumber()
  @IsOptional()
  sleepQuality?: number;

  // Additional notes
  @IsString()
  @IsOptional()
  notes?: string;
}

// ============================================================================
// CREATE MEDICAL RECORD DTO
// ============================================================================

export class CreateMedicalRecordDto {
  @IsUUID()
  @IsNotEmpty()
  consultationId: string;

  @IsEnum(MedicalRecordTemplate)
  templateType: MedicalRecordTemplate;

  @IsObject()
  @ValidateNested()
  @Type(() => ClinicalDataDto)
  clinicalData: ClinicalDataDto;
}
