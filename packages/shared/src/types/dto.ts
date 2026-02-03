// CANNEO - DTOs para requests e responses
import {
  UserRole,
  PaymentKind,
  PaymentMethod,
  AppointmentStatus,
  OrderStatus,
  PharmacyFulfillmentType,
  ConsentType,
} from './enums';

// ==================== AUTH DTOs ====================

export interface LoginRequestDto {
  email: string;
  password: string;
  portal: 'admin' | 'doctor' | 'patient' | 'pharmacy';
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  mfaRequired: boolean;
  mfaPending?: boolean;
}

export interface MfaSetupRequestDto {
  type: 'TOTP' | 'EMAIL_OTP';
}

export interface MfaSetupResponseDto {
  type: 'TOTP' | 'EMAIL_OTP';
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
}

export interface MfaVerifyRequestDto {
  code: string;
  type: 'TOTP' | 'EMAIL_OTP';
}

export interface StepUpAuthRequestDto {
  password: string;
  mfaCode?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

// ==================== USER DTOs ====================

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}

// ==================== DOCTOR DTOs ====================

export interface CreateDoctorDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  crmNumber: string;
  crmUF: string;
  specialty?: string;
}

export interface UpdateDoctorDto {
  specialty?: string;
}

export interface VerifyDoctorDto {
  verifiedStatus: 'VERIFIED' | 'REJECTED';
  reason?: string;
}

// ==================== PATIENT DTOs ====================

export interface CreatePatientDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: AddressDto;
}

export interface UpdatePatientDto {
  fullName?: string;
  phone?: string;
  birthDate?: string;
  address?: AddressDto;
}

// ==================== ADDRESS DTOs ====================

export interface AddressDto {
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  cep?: string;
  lat?: number;
  lng?: number;
}

// ==================== SCHEDULING DTOs ====================

export interface CreateSlotDto {
  startsAt: string; // ISO date string
  endsAt: string;
}

export interface CreateBulkSlotsDto {
  slots: CreateSlotDto[];
}

export interface SlotResponseDto {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

export interface CreateAppointmentDto {
  doctorId: string;
  slotId: string;
  paymentMethod: PaymentMethod;
}

export interface AppointmentResponseDto {
  id: string;
  status: AppointmentStatus;
  doctorId: string;
  patientId: string;
  slotId?: string;
  paymentIntentId?: string;
  startedAt?: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  doctor?: {
    id: string;
    fullName: string;
    specialty?: string;
    crmNumber: string;
    crmUF: string;
  };
  patient?: {
    id: string;
    fullName: string;
  };
  slot?: SlotResponseDto;
  videoSession?: {
    roomUrl: string;
    status: string;
  };
}

// ==================== PAYMENT DTOs ====================

export interface CreatePaymentIntentDto {
  kind: PaymentKind;
  method: PaymentMethod;
  amountCents: number;
  referenceType: 'APPOINTMENT' | 'ORDER';
  referenceId: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentResponseDto {
  id: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: string;
  amountCents: number;
  currency: string;
  expiresAt?: string;
  pixCode?: string;
  pixQrCode?: string;
  checkoutUrl?: string;
}

export interface WalletBalanceResponseDto {
  walletId: string;
  balanceTotal: number;
  balancePending: number;
  balanceAvailable: number;
  balanceOnHold: number;
  balanceWithdrawn: number;
  currency: string;
}

export interface LedgerEntryResponseDto {
  id: string;
  direction: 'CR' | 'DR';
  amountCents: number;
  currency: string;
  entryType: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

// ==================== WITHDRAWAL DTOs ====================

export interface CreateWithdrawalDto {
  bankAccountId: string;
  amountCents: number;
}

export interface WithdrawalResponseDto {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  bankAccount?: {
    bankCode?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };
}

// ==================== BANK ACCOUNT DTOs ====================

export interface CreateBankAccountDto {
  bankCode?: string;
  branch?: string;
  account?: string;
  accountDigit?: string;
  pixKey?: string;
}

export interface BankAccountResponseDto {
  id: string;
  bankCode?: string;
  branch?: string;
  accountMasked?: string;
  pixKeyMasked?: string;
  verifiedAt?: string;
}

// ==================== TELEHEALTH DTOs ====================

export interface VideoSessionResponseDto {
  roomUrl: string;
  token: string;
  expiresAt: string;
}

export interface StartRecordingDto {
  consentGiven: boolean;
}

export interface StartTranscriptionDto {
  consentGiven: boolean;
  language?: string;
}

// ==================== PRESCRIPTION DTOs ====================

export interface CreatePrescriptionDto {
  appointmentId: string;
  productName: string;
  thcPercent?: number;
  cbdPercent?: number;
  dosage: string;
  durationDays?: number;
  quantityText?: string;
  sncrRequired?: boolean;
}

export interface SignPrescriptionDto {
  certificateId: string;
  pin: string;
}

export interface PrescriptionResponseDto {
  id: string;
  status: string;
  productName: string;
  thcPercent?: number;
  cbdPercent?: number;
  dosage: string;
  durationDays?: number;
  quantityText?: string;
  sncrRequired: boolean;
  sncrNumber?: string;
  sncrStatus?: string;
  documentUrl?: string;
  createdAt: string;
}

// ==================== MEDICAL RECORDS DTOs ====================

export interface CreateRecordEntryDto {
  patientId: string;
  type: 'EVOLUTION' | 'NOTE' | 'EXAM' | 'ATTACHMENT';
  content: string;
}

export interface RecordEntryResponseDto {
  id: string;
  type: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface MedicalRecordResponseDto {
  id: string;
  patientId: string;
  entries: RecordEntryResponseDto[];
  documents: DocumentResponseDto[];
}

export interface DocumentResponseDto {
  id: string;
  type: string;
  signedUrl: string;
  signedAt?: string;
  signedByName?: string;
  createdAt: string;
}

// ==================== PHARMACY DTOs ====================

export interface CreatePharmacyDto {
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  shippingOriginCep: string;
  address?: AddressDto;
  supportsPickup?: boolean;
  supportsDelivery?: boolean;
}

export interface UpdatePharmacyDto {
  name?: string;
  phone?: string;
  email?: string;
  shippingOriginCep?: string;
  address?: AddressDto;
  slaMinutes?: number;
  supportsPickup?: boolean;
  supportsDelivery?: boolean;
}

export interface PharmacySearchDto {
  lat: number;
  lng: number;
  productIds?: string[];
  maxDistanceKm?: number;
}

export interface PharmacySearchResultDto {
  id: string;
  name: string;
  distanceKm: number;
  rating: number;
  slaMinutes: number;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  address?: AddressDto;
  estimatedShippingCents?: number;
  estimatedDeliveryDays?: number;
}

// ==================== INVENTORY DTOs ====================

export interface CreateInventoryItemDto {
  productId: string;
  priceCents: number;
  stockQty?: number;
}

export interface UpdateInventoryItemDto {
  priceCents?: number;
  inStock?: boolean;
  stockQty?: number;
}

export interface InventoryItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  priceCents: number;
  inStock: boolean;
  stockQty?: number;
}

// ==================== ORDER DTOs ====================

export interface CreateOrderDto {
  pharmacyId: string;
  fulfillmentType: PharmacyFulfillmentType;
  items: CreateOrderItemDto[];
  shippingAddress?: AddressDto;
  shippingQuoteId?: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface OrderResponseDto {
  id: string;
  status: OrderStatus;
  pharmacyId: string;
  pharmacyName: string;
  fulfillmentType: PharmacyFulfillmentType;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  items: OrderItemResponseDto[];
  shippingAddress?: AddressDto;
  paymentIntent?: PaymentIntentResponseDto;
  shipment?: ShipmentResponseDto;
  createdAt: string;
}

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

// ==================== SHIPPING DTOs ====================

export interface GetShippingQuotesDto {
  pharmacyId: string;
  destinationCep: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface ShippingQuoteResponseDto {
  id: string;
  provider: string;
  serviceName: string;
  serviceCode: string;
  priceCents: number;
  deliveryDays: number;
}

export interface ShipmentResponseDto {
  id: string;
  status: string;
  provider: string;
  serviceName?: string;
  trackingCode?: string;
  trackingUrl?: string;
  labelUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface CreateShipmentDto {
  orderId: string;
  serviceCode: string;
}

// ==================== CONSENT DTOs ====================

export interface CreateConsentDto {
  type: ConsentType;
  version: string;
}

export interface ConsentResponseDto {
  id: string;
  type: ConsentType;
  version: string;
  acceptedAt: string;
  revokedAt?: string;
}

// ==================== AUDIT DTOs ====================

export interface AuditLogQueryDto {
  resourceType?: string;
  resourceId?: string;
  actorUserId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponseDto {
  id: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ==================== PAGINATION DTOs ====================

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
