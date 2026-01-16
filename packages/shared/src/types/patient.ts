// ============================================================================
// PATIENT TYPES
// ============================================================================

export interface CreatePatientDto {
  name: string;
  cpf: string;
  birthDate: string; // ISO date
  email?: string;
  phone?: string;
  gender?: string;
  address?: AddressDto;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
}

export interface UpdatePatientDto {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: AddressDto;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  pipelineStatus?: string;
}

export interface PatientDto {
  id: string;
  name: string;
  cpfLastFour: string; // Apenas últimos 4 dígitos
  birthDate: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: AddressDto;
  allergies: string[];
  conditions: string[];
  medications: string[];
  pipelineStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetailDto extends PatientDto {
  cpf: string; // CPF completo (descriptografado)
  consultations: ConsultationSummaryDto[];
  documents: PatientDocumentDto[];
}

export interface AddressDto {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ConsultationSummaryDto {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  doctorName: string;
}

export interface PatientDocumentDto {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

// Pipeline statuses
export const PIPELINE_STATUSES = [
  'LEAD',
  'CONTATO_INICIAL',
  'CONSULTA_AGENDADA',
  'EM_CONSULTA',
  'PRESCRICAO_EMITIDA',
  'DOCUMENTACAO_ANVISA',
  'SUBMETIDO_ANVISA',
  'APROVADO',
  'EM_TRATAMENTO',
  'INATIVO',
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];
