// CANNEO - Auth validation schemas (Zod)
import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================

export const portalSchema = z.enum(['admin', 'doctor', 'patient', 'pharmacy']);

export const loginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  portal: portalSchema,
});

export const mfaTypeSchema = z.enum(['TOTP', 'EMAIL_OTP']);

export const mfaSetupRequestSchema = z.object({
  type: mfaTypeSchema,
});

export const mfaVerifyRequestSchema = z.object({
  code: z
    .string()
    .min(6, 'Código deve ter 6 dígitos')
    .max(8, 'Código inválido')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
  type: mfaTypeSchema,
});

export const stepUpAuthRequestSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
  mfaCode: z.string().optional(),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  portal: portalSchema,
});

export const resetPasswordRequestSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Type exports
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type MfaSetupRequest = z.infer<typeof mfaSetupRequestSchema>;
export type MfaVerifyRequest = z.infer<typeof mfaVerifyRequestSchema>;
export type StepUpAuthRequest = z.infer<typeof stepUpAuthRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
