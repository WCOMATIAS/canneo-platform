import {
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsOptional,
  ValidateNested,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================================
// ADDRESS DTO
// ============================================================================

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

// ============================================================================
// PATIENT FORM DATA
// ============================================================================

class PatientFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;
}

// ============================================================================
// DOCTOR FORM DATA
// ============================================================================

class DoctorFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsString()
  @IsNotEmpty()
  ufCrm: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

// ============================================================================
// DIAGNOSIS FORM DATA
// ============================================================================

class DiagnosisFormDto {
  @IsString()
  @IsNotEmpty()
  icd10Code: string;

  @IsString()
  @IsNotEmpty()
  icd10Description: string;

  @IsString()
  @IsNotEmpty()
  clinicalHistory: string;

  @IsString()
  @IsNotEmpty()
  previousTreatments: string;

  @IsString()
  @IsNotEmpty()
  treatmentFailures: string;

  @IsString()
  @IsNotEmpty()
  scientificEvidence: string;

  @IsString()
  @IsNotEmpty()
  expectedBenefits: string;

  @IsString()
  @IsNotEmpty()
  potentialRisks: string;
}

// ============================================================================
// PRESCRIPTION FORM DATA
// ============================================================================

class PrescriptionFormDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  composition: string;

  @IsString()
  @IsNotEmpty()
  concentration: string;

  @IsString()
  @IsNotEmpty()
  presentation: string;

  @IsString()
  @IsNotEmpty()
  administrationRoute: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;
}

// ============================================================================
// MONITORING FORM DATA
// ============================================================================

class MonitoringFormDto {
  @IsString()
  @IsNotEmpty()
  returnFrequency: string;

  @IsArray()
  @IsString({ each: true })
  evaluationParameters: string[];

  @IsString()
  @IsNotEmpty()
  discontinuationCriteria: string;
}

// ============================================================================
// DECLARATIONS FORM DATA
// ============================================================================

class DeclarationsFormDto {
  @IsBoolean()
  patientInformed: boolean;

  @IsBoolean()
  risksExplained: boolean;

  @IsBoolean()
  alternativesDiscussed: boolean;

  @IsBoolean()
  consentObtained: boolean;
}

// ============================================================================
// ANVISA FORM DATA (Complete)
// ============================================================================

export class AnvisaFormDataDto {
  @ValidateNested()
  @Type(() => PatientFormDto)
  patient: PatientFormDto;

  @ValidateNested()
  @Type(() => DoctorFormDto)
  doctor: DoctorFormDto;

  @ValidateNested()
  @Type(() => DiagnosisFormDto)
  diagnosis: DiagnosisFormDto;

  @ValidateNested()
  @Type(() => PrescriptionFormDto)
  prescription: PrescriptionFormDto;

  @ValidateNested()
  @Type(() => MonitoringFormDto)
  monitoring: MonitoringFormDto;

  @ValidateNested()
  @Type(() => DeclarationsFormDto)
  declarations: DeclarationsFormDto;
}

// ============================================================================
// CREATE ANVISA REPORT DTO
// ============================================================================

export class CreateAnvisaReportDto {
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId: string;

  @IsUUID()
  @IsOptional()
  prescriptionId?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AnvisaFormDataDto)
  formData: AnvisaFormDataDto;
}
