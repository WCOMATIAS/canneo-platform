// CANNEO - Telehealth validation schemas (Zod)
import { z } from 'zod';

// ==================== VIDEO SESSION SCHEMAS ====================

export const videoSessionStatusSchema = z.enum(['CREATED', 'STARTED', 'ENDED']);

export const joinVideoSessionSchema = z.object({
  appointmentId: z.string().cuid('ID da consulta inválido'),
});

export const startRecordingSchema = z.object({
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento para gravação é obrigatório' }),
  }),
});

export const startTranscriptionSchema = z.object({
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento para transcrição é obrigatório' }),
  }),
  language: z.string().default('pt-BR'),
});

// ==================== CONSENT SCHEMAS ====================

export const consentTypeSchema = z.enum([
  'TELECONSULTA',
  'HEALTH_DATA',
  'RECORDING',
  'TRANSCRIPTION',
  'GEOLOCATION',
  'WHATSAPP',
  'EMAIL',
]);

export const createConsentSchema = z.object({
  type: consentTypeSchema,
  version: z.string().min(1, 'Versão é obrigatória').max(20),
});

export const revokeConsentSchema = z.object({
  consentId: z.string().cuid('ID do consentimento inválido'),
});

export const checkConsentsSchema = z.object({
  types: z.array(consentTypeSchema).min(1, 'Informe pelo menos um tipo de consentimento'),
});

// Type exports
export type JoinVideoSession = z.infer<typeof joinVideoSessionSchema>;
export type StartRecording = z.infer<typeof startRecordingSchema>;
export type StartTranscription = z.infer<typeof startTranscriptionSchema>;
export type CreateConsent = z.infer<typeof createConsentSchema>;
export type RevokeConsent = z.infer<typeof revokeConsentSchema>;
export type CheckConsents = z.infer<typeof checkConsentsSchema>;
