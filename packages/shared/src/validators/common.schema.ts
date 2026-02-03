// CANNEO - Common validation schemas (Zod)
import { z } from 'zod';

// ==================== ADDRESS SCHEMA ====================

export const addressSchema = z.object({
  street: z.string().max(255).optional(),
  number: z.string().max(20).optional(),
  complement: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  country: z.string().max(2).default('BR'),
  cep: z
    .string()
    .regex(/^\d{8}$/, 'CEP inválido')
    .optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// ==================== PAGINATION SCHEMA ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ==================== DATE RANGE SCHEMA ====================

export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime('Data de início inválida'),
    endDate: z.string().datetime('Data de fim inválida'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    { message: 'Data de fim deve ser igual ou posterior à data de início' }
  );

// ==================== ID SCHEMAS ====================

export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export const idsArraySchema = z.object({
  ids: z.array(z.string().cuid('ID inválido')).min(1).max(100),
});

// ==================== FILE UPLOAD SCHEMA ====================

export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024), // max 50MB
});

// ==================== SEARCH SCHEMA ====================

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  ...paginationSchema.shape,
});

// Type exports
export type Address = z.infer<typeof addressSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type IdsArray = z.infer<typeof idsArraySchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type Search = z.infer<typeof searchSchema>;
