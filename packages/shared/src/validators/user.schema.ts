// CANNEO - User validation schemas (Zod)
import { z } from 'zod';
import { passwordSchema } from './auth.schema';

// ==================== USER SCHEMAS ====================

export const userRoleSchema = z.enum(['ADMIN', 'OPERATIONS', 'DOCTOR', 'PATIENT', 'PHARMACY']);
export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional(),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

// ==================== DOCTOR SCHEMAS ====================

export const crmUFSchema = z.enum([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

export const createDoctorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional(),
  crmNumber: z
    .string()
    .min(4, 'CRM inválido')
    .max(10)
    .regex(/^\d+$/, 'CRM deve conter apenas números'),
  crmUF: crmUFSchema,
  specialty: z.string().min(2).max(100).optional(),
});

export const updateDoctorSchema = z.object({
  specialty: z.string().min(2).max(100).optional(),
});

export const verifyDoctorSchema = z.object({
  verifiedStatus: z.enum(['VERIFIED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

// ==================== PATIENT SCHEMAS ====================

export const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, 'CPF inválido')
  .refine(
    (cpf) => {
      // CPF validation algorithm
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
      let rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(cpf[9])) return false;
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
      rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      return rev === parseInt(cpf[10]);
    },
    { message: 'CPF inválido' }
  );

export const createPatientSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional(),
  cpf: cpfSchema.optional(),
  birthDate: z.string().datetime().optional(),
});

export const updatePatientSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional()
    .nullable(),
  birthDate: z.string().datetime().optional().nullable(),
});

// Type exports
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type CreateDoctor = z.infer<typeof createDoctorSchema>;
export type UpdateDoctor = z.infer<typeof updateDoctorSchema>;
export type VerifyDoctor = z.infer<typeof verifyDoctorSchema>;
export type CreatePatient = z.infer<typeof createPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
