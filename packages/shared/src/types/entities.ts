// CANNEO - Entity types (espelham o schema Prisma)
import {
  UserRole,
  UserStatus,
  MfaType,
  PaymentKind,
  PaymentMethod,
  PaymentIntentStatus,
  AppointmentStatus,
  OrderStatus,
  ShipmentStatus,
  WithdrawalStatus,
  WalletOwnerType,
  LedgerDirection,
  LedgerEntryType,
  HoldReason,
  HoldStatus,
  ConsentType,
  ResourceType,
  WebhookProvider,
  WebhookStatus,
  PharmacyFulfillmentType,
} from './enums';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== CORE / MULTI-TENANT ====================

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface User extends BaseEntity {
  tenantId?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  phone?: string;
  lastLoginAt?: Date;
}

export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  accessIssuedAt: Date;
  refreshExpiresAt: Date;
  deviceHash?: string;
  ipMasked?: string;
  userAgentHash?: string;
  revokedAt?: Date;
  createdAt: Date;
}

export interface MfaSecret {
  id: string;
  userId: string;
  type: MfaType;
  secretEnc: string;
  enabledAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
}

// ==================== PROFILES ====================

export interface Doctor extends BaseEntity {
  tenantId?: string;
  userId: string;
  crmNumber: string;
  crmUF: string;
  specialty?: string;
  verifiedStatus: string;
  verifiedAt?: Date;
}

export interface Patient extends BaseEntity {
  tenantId?: string;
  userId: string;
  cpfEnc?: string;
  birthDate?: Date;
  addressId?: string;
}

export interface Pharmacy extends BaseEntity {
  tenantId?: string;
  name: string;
  cnpjEnc?: string;
  phone?: string;
  email?: string;
  addressId?: string;
  shippingOriginCep: string;
  lat?: number;
  lng?: number;
  slaMinutes: number;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  rating: number;
}

export interface PharmacyUser {
  id: string;
  pharmacyId: string;
  userId: string;
  createdAt: Date;
}

export interface Address extends BaseEntity {
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

// ==================== SCHEDULING ====================

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  isBooked: boolean;
  createdAt: Date;
}

export interface Appointment extends BaseEntity {
  tenantId?: string;
  status: AppointmentStatus;
  doctorId: string;
  patientId: string;
  slotId?: string;
  paymentIntentId?: string;
  startedAt?: Date;
  endedAt?: Date;
  notes?: string;
}

// ==================== TELEHEALTH ====================

export interface VideoSession extends BaseEntity {
  appointmentId: string;
  provider: string;
  roomName: string;
  roomUrl: string;
  meetingId?: string;
  status: string;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  recordingUrl?: string;
  transcriptionUrl?: string;
  transcriptionText?: string;
}

// ==================== MEDICAL RECORDS ====================

export interface MedicalRecord extends BaseEntity {
  patientId: string;
}

export interface RecordEntry {
  id: string;
  medicalRecordId: string;
  authorUserId: string;
  type: string;
  content: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  medicalRecordId?: string;
  appointmentId?: string;
  prescriptionId?: string;
  type: string;
  fileUrl: string;
  hashPre?: string;
  hashPost?: string;
  signedByUserId?: string;
  signedAt?: Date;
  createdAt: Date;
}

export interface Prescription extends BaseEntity {
  appointmentId: string;
  doctorId: string;
  patientId: string;
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
}

// ==================== PAYMENTS / LEDGER ====================

export interface Wallet {
  id: string;
  tenantId?: string;
  ownerType: WalletOwnerType;
  ownerId?: string;
  currency: string;
  createdAt: Date;
}

export interface WalletBalance {
  id: string;
  walletId: string;
  balanceTotal: number; // centavos
  balancePending: number; // centavos
  balanceAvailable: number; // centavos
  balanceOnHold: number; // centavos
  balanceWithdrawn: number; // centavos
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  tenantId?: string;
  walletId: string;
  direction: LedgerDirection;
  amountCents: number;
  currency: string;
  entryType: LedgerEntryType;
  referenceType: ResourceType;
  referenceId: string;
  idempotencyKey?: string;
  createdAt: Date;
}

export interface PaymentIntent extends BaseEntity {
  tenantId?: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentIntentStatus;
  amountCents: number;
  currency: string;
  customerUserId?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentAttempt {
  id: string;
  paymentIntentId: string;
  pspProvider: string;
  pspPaymentId?: string;
  status: string;
  failureCode?: string;
  rawPayload?: Record<string, unknown>;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  eventId: string;
  eventType: string;
  status: WebhookStatus;
  receivedAt: Date;
  processedAt?: Date;
  rawPayload?: Record<string, unknown>;
}

export interface Fee {
  id: string;
  tenantId?: string;
  paymentIntentId: string;
  gatewayFeeCents: number;
  canneoFeeCents: number;
  otherFeeCents: number;
  gatewayRateBps?: number;
  canneoRateBps?: number;
  createdAt: Date;
}

export interface Hold {
  id: string;
  tenantId?: string;
  paymentIntentId?: string;
  walletId: string;
  amountCents: number;
  reason: HoldReason;
  status: HoldStatus;
  releaseAt?: Date;
  createdAt: Date;
  releasedAt?: Date;
}

export interface Refund extends BaseEntity {
  tenantId?: string;
  paymentIntentId: string;
  amountCents: number;
  status: string;
  reason?: string;
}

export interface Chargeback extends BaseEntity {
  tenantId?: string;
  paymentIntentId: string;
  amountCents: number;
  status: string;
  openedAt?: Date;
  closedAt?: Date;
}

export interface BankAccount extends BaseEntity {
  tenantId?: string;
  ownerType: WalletOwnerType;
  ownerId: string;
  bankCode?: string;
  branch?: string;
  account?: string;
  accountDigit?: string;
  pixKeyEnc?: string;
  verifiedAt?: Date;
}

export interface Withdrawal {
  id: string;
  tenantId?: string;
  doctorId: string;
  walletId: string;
  bankAccountId: string;
  amountCents: number;
  currency: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
  pspProvider?: string;
  pspPayoutId?: string;
}

// ==================== PHARMACY COMMERCE ====================

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  sku: string;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  productId: string;
  priceCents: number;
  inStock: boolean;
  stockQty?: number;
  updatedAt: Date;
}

export interface Order extends BaseEntity {
  tenantId?: string;
  status: OrderStatus;
  patientId: string;
  pharmacyId: string;
  fulfillmentType: PharmacyFulfillmentType;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  shippingAddressId?: string;
  paymentIntentId?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface ShippingQuote {
  id: string;
  orderId?: string;
  pharmacyId: string;
  originCep: string;
  destinationCep: string;
  provider: string;
  serviceName?: string;
  serviceCode?: string;
  priceCents: number;
  deliveryDays?: number;
  rawPayload?: Record<string, unknown>;
  createdAt: Date;
}

export interface Shipment extends BaseEntity {
  orderId: string;
  status: ShipmentStatus;
  provider: string;
  serviceName?: string;
  serviceCode?: string;
  trackingCode?: string;
  labelUrl?: string;
  melhorEnvioCartId?: string;
  melhorEnvioShipmentId?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface MelhorEnvioToken extends BaseEntity {
  pharmacyId: string;
  accessTokenEnc: string;
  refreshTokenEnc?: string;
  expiresAt?: Date;
  scope?: string;
}

// ==================== CONSENTS & AUDIT ====================

export interface Consent {
  id: string;
  tenantId?: string;
  userId: string;
  type: ConsentType;
  version: string;
  acceptedAt: Date;
  revokedAt?: Date;
  ipMasked?: string;
  userAgentHash?: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  actorUserId?: string;
  actorRole?: UserRole;
  action: string;
  resourceType: ResourceType;
  resourceId: string;
  correlationId?: string;
  ipMasked?: string;
  userAgentHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
