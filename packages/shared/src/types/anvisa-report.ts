// ============================================================================
// ANVISA REPORT TYPES
// ============================================================================

export interface CreateAnvisaReportDto {
  medicalRecordId: string;
  prescriptionId?: string;
  formData: AnvisaFormData;
}

export interface UpdateAnvisaReportDto {
  formData: Partial<AnvisaFormData>;
}

export interface AnvisaReportDto {
  id: string;
  medicalRecordId: string;
  prescriptionId?: string;
  patientId: string;
  doctorId: string;
  formData: AnvisaFormData;
  status: AnvisaReportStatus;
  signatureHash?: string;
  signedAt?: string;
  pdfUrl?: string;
  packageUrl?: string;
  submittedAt?: string;
  protocolNumber?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnvisaReportStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

// ============================================================================
// ANVISA FORM DATA (conforme RDC 660/2022)
// ============================================================================

export interface AnvisaFormData {
  // I. IDENTIFICACAO DO PACIENTE
  patient: {
    name: string;
    cpf: string;
    birthDate: string;
    nationality: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email?: string;
  };

  // II. IDENTIFICACAO DO MEDICO PRESCRITOR
  doctor: {
    name: string;
    crm: string;
    ufCrm: string;
    specialty?: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };

  // III. DIAGNOSTICO E JUSTIFICATIVA CLINICA
  diagnosis: {
    icd10Code: string;
    icd10Description: string;
    clinicalHistory: string;
    previousTreatments: string;
    treatmentFailures: string;
    scientificEvidence: string;
    expectedBenefits: string;
    potentialRisks: string;
  };

  // IV. PRESCRICAO
  prescription: {
    productName: string;
    manufacturer: string;
    composition: string; // THC/CBD concentrations
    concentration: string;
    presentation: string;
    administrationRoute: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
  };

  // V. MONITORAMENTO
  monitoring: {
    returnFrequency: string;
    evaluationParameters: string[];
    discontinuationCriteria: string;
  };

  // VI. DECLARACOES
  declarations: {
    patientInformed: boolean;
    risksExplained: boolean;
    alternativesDiscussed: boolean;
    consentObtained: boolean;
  };
}

// ============================================================================
// ANVISA PACKAGE (ZIP) CONTENTS
// ============================================================================

export interface AnvisaPackageContents {
  laudo: string; // PDF URL
  prescricao: string; // PDF URL
  tcle: string; // PDF URL
  termoResponsabilidade: string; // PDF URL
  documentosPaciente: string[]; // RG, CPF, comprovante residência
  checklist: AnvisaChecklist;
}

export interface AnvisaChecklist {
  laudoCompleto: boolean;
  prescricaoAssinada: boolean;
  tcleAssinado: boolean;
  documentosPaciente: boolean;
  crmVerificado: boolean;
  dadosCompletos: boolean;
  prontoParaSubmissao: boolean;
}
