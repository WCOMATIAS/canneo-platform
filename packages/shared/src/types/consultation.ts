// ============================================================================
// CONSULTATION TYPES
// ============================================================================

export interface CreateConsultationDto {
  patientId: string;
  doctorId: string;
  type: ConsultationType;
  scheduledAt: string; // ISO datetime
  duration?: number; // minutes
  notes?: string;
}

export interface UpdateConsultationDto {
  scheduledAt?: string;
  duration?: number;
  notes?: string;
  cancelReason?: string;
}

export interface ConsultationDto {
  id: string;
  patientId: string;
  doctorId: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt: string;
  duration: number;
  startedAt?: string;
  endedAt?: string;
  dailyRoomUrl?: string;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    cpfLastFour: string;
  };
  doctor: {
    id: string;
    name: string;
    crm: string;
    ufCrm: string;
  };
}

export interface VideoTokenResponse {
  token: string;
  roomUrl: string;
  roomName: string;
  expiresAt: string;
}

export type ConsultationType =
  | 'PRIMEIRA_CONSULTA'
  | 'RETORNO'
  | 'AJUSTE_DOSE'
  | 'EMERGENCIA';

export type ConsultationStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

// Availability
export interface AvailabilityDto {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  slotDuration: number; // minutes
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

export interface CreateAvailabilityDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  breakStart?: string;
  breakEnd?: string;
}

export interface TimeSlot {
  startTime: string; // ISO datetime
  endTime: string;
  available: boolean;
}
