// ============================================================================
// MEDICAL RECORD TYPES
// ============================================================================

export interface CreateMedicalRecordDto {
  consultationId: string;
  templateType: MedicalRecordTemplate;
  clinicalData: ClinicalData;
}

export interface UpdateMedicalRecordDto {
  clinicalData: Partial<ClinicalData>;
}

export interface MedicalRecordDto {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  templateType: MedicalRecordTemplate;
  clinicalData: ClinicalData;
  status: DocumentStatus;
  signatureHash?: string;
  signedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicalRecordTemplate =
  | 'PRIMEIRA_CONSULTA'
  | 'RETORNO'
  | 'AJUSTE_DOSE';

export type DocumentStatus = 'DRAFT' | 'SIGNED' | 'REVOKED';

// ============================================================================
// CLINICAL DATA (JSON structure for templates)
// ============================================================================

export interface ClinicalData {
  // Common fields
  chiefComplaint?: string; // Queixa principal
  historyOfPresentIllness?: string; // História da doença atual

  // Medical history
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;

  // Cannabis specific
  previousCannabisUse?: boolean;
  previousCannabisExperience?: string;
  currentMedications?: string[];
  allergies?: string[];

  // Physical exam
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  physicalExam?: string;

  // Diagnosis
  primaryDiagnosis?: DiagnosisEntry;
  secondaryDiagnoses?: DiagnosisEntry[];

  // Treatment plan
  treatmentPlan?: string;
  cannabisRecommendation?: CannabisRecommendation;

  // Follow-up
  followUpInstructions?: string;
  nextAppointment?: string;

  // For AJUSTE_DOSE template
  currentDose?: string;
  newDose?: string;
  adjustmentReason?: string;
  sideEffects?: string[];
  effectiveness?: number; // 1-10 scale

  // For RETORNO template
  treatmentResponse?: string;
  qualityOfLife?: number; // 1-10 scale
  painLevel?: number; // 0-10 scale
  sleepQuality?: number; // 1-10 scale

  // Additional notes
  notes?: string;
}

export interface DiagnosisEntry {
  icd10Code: string; // Ex: "G40.9"
  description: string;
}

export interface CannabisRecommendation {
  productType: string; // Full Spectrum, CBD Isolado, etc.
  concentration: string;
  administration: string; // Sublingual, Oral, etc.
  startingDose: string;
  titration: string; // Instruções de titulação
  duration: string; // Duração inicial do tratamento
}
