// CANNEO - Prescription validation schemas (Zod)
import { z } from 'zod';

// ==================== PRESCRIPTION STATUS ====================

export const prescriptionStatusSchema = z.enum(['DRAFT', 'SIGNED', 'SNCR_REGISTERED', 'CANCELLED']);

// ==================== PRESCRIPTION SCHEMAS ====================

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().cuid('ID da consulta inválido'),
  productName: z.string().min(2, 'Nome do produto é obrigatório').max(255),
  thcPercent: z.number().min(0).max(100).optional(),
  cbdPercent: z.number().min(0).max(100).optional(),
  dosage: z.string().min(2, 'Posologia é obrigatória').max(1000),
  durationDays: z.number().int().min(1).max(365).optional(),
  quantityText: z.string().max(255).optional(),
  sncrRequired: z.boolean().default(false),
});

export const updatePrescriptionSchema = z.object({
  productName: z.string().min(2).max(255).optional(),
  thcPercent: z.number().min(0).max(100).optional().nullable(),
  cbdPercent: z.number().min(0).max(100).optional().nullable(),
  dosage: z.string().min(2).max(1000).optional(),
  durationDays: z.number().int().min(1).max(365).optional().nullable(),
  quantityText: z.string().max(255).optional().nullable(),
});

export const signPrescriptionSchema = z.object({
  certificateId: z.string().min(1, 'ID do certificado é obrigatório'),
  pin: z.string().min(4, 'PIN é obrigatório').max(20),
});

// ==================== SNCR SCHEMAS ====================

export const sncrRegisterSchema = z.object({
  prescriptionId: z.string().cuid('ID da prescrição inválido'),
  patientCpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  patientName: z.string().min(2).max(255),
});

// ==================== MEDICAL RECORD SCHEMAS ====================

export const recordEntryTypeSchema = z.enum(['EVOLUTION', 'NOTE', 'EXAM', 'ATTACHMENT']);

export const createRecordEntrySchema = z.object({
  patientId: z.string().cuid('ID do paciente inválido'),
  type: recordEntryTypeSchema,
  content: z.string().min(1, 'Conteúdo é obrigatório').max(50000),
});

// ==================== DOCUMENT SCHEMAS ====================

export const documentTypeSchema = z.enum(['PRESCRIPTION', 'LAUDO', 'ATESTADO', 'TCLE', 'EXAM_RESULT']);

export const uploadDocumentSchema = z.object({
  type: documentTypeSchema,
  medicalRecordId: z.string().cuid().optional(),
  appointmentId: z.string().cuid().optional(),
  prescriptionId: z.string().cuid().optional(),
});

// Type exports
export type CreatePrescription = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescription = z.infer<typeof updatePrescriptionSchema>;
export type SignPrescription = z.infer<typeof signPrescriptionSchema>;
export type SncrRegister = z.infer<typeof sncrRegisterSchema>;
export type CreateRecordEntry = z.infer<typeof createRecordEntrySchema>;
export type UploadDocument = z.infer<typeof uploadDocumentSchema>;
