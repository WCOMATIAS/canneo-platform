// CANNEO - Scheduling validation schemas (Zod)
import { z } from 'zod';
import { paymentMethodSchema } from './payment.schema';

// ==================== APPOINTMENT STATUS ====================

export const appointmentStatusSchema = z.enum([
  'DRAFT',
  'AWAITING_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
  'REFUNDED',
]);

// ==================== SLOT SCHEMAS ====================

export const createSlotSchema = z
  .object({
    startsAt: z.string().datetime('Data de início inválida'),
    endsAt: z.string().datetime('Data de fim inválida'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      const end = new Date(data.endsAt);
      return end > start;
    },
    { message: 'Data de fim deve ser posterior à data de início' }
  )
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      const now = new Date();
      return start > now;
    },
    { message: 'Não é possível criar slots no passado' }
  );

export const createBulkSlotsSchema = z.object({
  slots: z.array(createSlotSchema).min(1, 'Informe pelo menos um slot').max(100, 'Máximo 100 slots por vez'),
});

// Recurring slots pattern
export const createRecurringSlotsSchema = z
  .object({
    startDate: z.string().datetime('Data de início inválida'),
    endDate: z.string().datetime('Data de fim inválida'),
    slotDurationMinutes: z.number().int().min(15).max(120),
    weekdays: z.array(z.number().int().min(0).max(6)).min(1, 'Selecione pelo menos um dia da semana'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)'),
    breakStartTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)')
      .optional(),
    breakEndTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)')
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    { message: 'Data de fim deve ser posterior à data de início' }
  );

// ==================== APPOINTMENT SCHEMAS ====================

export const createAppointmentSchema = z.object({
  doctorId: z.string().cuid('ID do médico inválido'),
  slotId: z.string().cuid('ID do slot inválido'),
  paymentMethod: paymentMethodSchema,
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
  notes: z.string().max(2000).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
  requestRefund: z.boolean().default(false),
});

export const completeAppointmentSchema = z.object({
  notes: z.string().max(5000).optional(),
});

// ==================== SEARCH SCHEMAS ====================

export const searchDoctorsSchema = z.object({
  specialty: z.string().max(100).optional(),
  crmUF: z.string().length(2).optional(),
  name: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const searchSlotsSchema = z.object({
  doctorId: z.string().cuid('ID do médico inválido'),
  startDate: z.string().datetime('Data de início inválida'),
  endDate: z.string().datetime('Data de fim inválida'),
});

// Type exports
export type CreateSlot = z.infer<typeof createSlotSchema>;
export type CreateBulkSlots = z.infer<typeof createBulkSlotsSchema>;
export type CreateRecurringSlots = z.infer<typeof createRecurringSlotsSchema>;
export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatus = z.infer<typeof updateAppointmentStatusSchema>;
export type CancelAppointment = z.infer<typeof cancelAppointmentSchema>;
export type CompleteAppointment = z.infer<typeof completeAppointmentSchema>;
export type SearchDoctors = z.infer<typeof searchDoctorsSchema>;
export type SearchSlots = z.infer<typeof searchSlotsSchema>;
