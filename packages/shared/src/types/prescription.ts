// ============================================================================
// PRESCRIPTION TYPES
// ============================================================================

export interface CreatePrescriptionDto {
  medicalRecordId: string;
  productId?: string; // Optional - can use custom product
  productName: string;
  concentration: string;
  dosage: string;
  quantity: string;
  instructions?: string;
  validUntil: string; // ISO date
}

export interface PrescriptionDto {
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  productId?: string;
  productName: string;
  concentration: string;
  dosage: string;
  quantity: string;
  instructions?: string;
  validUntil: string;
  status: DocumentStatus;
  signatureHash?: string;
  signedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  product?: CannabisProductDto;
}

export type DocumentStatus = 'DRAFT' | 'SIGNED' | 'REVOKED';

// ============================================================================
// CANNABIS PRODUCT TYPES
// ============================================================================

export interface CannabisProductDto {
  id: string;
  name: string;
  manufacturer: string;
  activeCompound: string;
  concentration: string;
  thcPercentage?: number;
  cbdPercentage?: number;
  presentation: string;
  volume?: string;
  administrationRoute: string;
  description?: string;
}

export interface CannabisProductSearchParams {
  search?: string;
  activeCompound?: string;
  administrationRoute?: string;
  manufacturer?: string;
}
