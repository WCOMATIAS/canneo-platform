export const SCHEDULING_CONSTANTS = {
  // Reserva temporária de slot (minutos)
  SLOT_RESERVATION_MINUTES: 5,

  // Duração padrão de consulta (minutos)
  DEFAULT_APPOINTMENT_DURATION_MINUTES: 30,

  // Antecedência mínima para agendar (horas)
  MIN_BOOKING_ADVANCE_HOURS: 1,

  // Antecedência máxima para agendar (dias)
  MAX_BOOKING_ADVANCE_DAYS: 60,

  // Janela de tolerância para iniciar consulta (minutos)
  START_TOLERANCE_MINUTES: 15,

  // Tempo máximo de consulta (minutos)
  MAX_APPOINTMENT_DURATION_MINUTES: 120,

  // Lembretes
  REMINDER_HOURS_BEFORE: [24, 2],

  // Queues
  SLOT_EXPIRATION_QUEUE: 'slot-expiration',
  APPOINTMENT_REMINDER_QUEUE: 'appointment-reminder',

  // Cron
  SLOT_EXPIRATION_CRON: '* * * * *', // Cada minuto
  REMINDER_CHECK_CRON: '0 * * * *', // Cada hora
} as const;

// Transições de estado válidas
export const APPOINTMENT_STATE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['AWAITING_PAYMENT', 'CANCELLED'],
  AWAITING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'NO_SHOW', 'CANCELLED', 'REFUNDED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['REFUNDED'],
  NO_SHOW: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};
