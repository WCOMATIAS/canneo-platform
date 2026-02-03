// @canneo/shared - Utilities

import { ANTIFRAUD_HOLD_DAYS, DEFAULT_FEE_RATES } from '../constants';

// ==================== MONEY UTILITIES ====================

/**
 * Format centavos to BRL currency string
 * @param centavos Amount in centavos
 * @returns Formatted currency string (e.g., "R$ 100,00")
 */
export function formatCentavos(centavos: number): string {
  const reais = centavos / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

/**
 * Parse BRL currency string to centavos
 * @param value Currency string (e.g., "100,00" or "R$ 100,00")
 * @returns Amount in centavos
 */
export function parseToCentavos(value: string): number {
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100);
}

/**
 * Calculate split fees for a payment
 * All values in centavos
 */
export interface SplitResult {
  gross: number;
  gatewayFee: number;
  canneoFee: number;
  netToDoctor: number;
}

export function calculateSplit(
  grossCents: number,
  gatewayRateBps = DEFAULT_FEE_RATES.GATEWAY_RATE_BPS,
  gatewayFixedCents = DEFAULT_FEE_RATES.GATEWAY_FIXED_CENTS,
  canneoRateBps = DEFAULT_FEE_RATES.CANNEO_RATE_BPS
): SplitResult {
  // gateway_fee = round_half_up(gross * gateway_rate) + gateway_fixed
  const gatewayFee = Math.round((grossCents * gatewayRateBps) / 10000) + gatewayFixedCents;

  // net_base = gross - gateway_fee
  const netBase = grossCents - gatewayFee;

  // canneo_fee = round_half_up(net_base * canneo_rate)
  const canneoFee = Math.round((netBase * canneoRateBps) / 10000);

  // doctor_net = net_base - canneo_fee
  const netToDoctor = netBase - canneoFee;

  return {
    gross: grossCents,
    gatewayFee,
    canneoFee,
    netToDoctor,
  };
}

// ==================== DATE UTILITIES ====================

/**
 * Calculate antifraud hold release date based on payment method
 */
export function calculateHoldReleaseDate(
  paymentMethod: 'PIX' | 'CARD_CREDIT' | 'CARD_DEBIT',
  paymentDate: Date = new Date()
): Date {
  const holdDays = ANTIFRAUD_HOLD_DAYS[paymentMethod];
  const releaseDate = new Date(paymentDate);
  releaseDate.setDate(releaseDate.getDate() + holdDays);
  return releaseDate;
}

/**
 * Format date to Brazilian format
 */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format datetime to Brazilian format
 */
export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// ==================== MASKING UTILITIES ====================

/**
 * Mask CPF for display (XXX.XXX.XXX-XX -> ***.XXX.XXX-**)
 */
export function maskCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return '***.***.***-**';
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

/**
 * Mask email for display (user@domain.com -> u***@d*****.com)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const [domainName, ...ext] = domain.split('.');
  return `${local[0]}***@${domainName[0]}*****.${ext.join('.')}`;
}

/**
 * Mask phone for display (+5511999999999 -> +55 11 *****-9999)
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return '*****-****';
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} *****-${digits.slice(-4)}`;
}

/**
 * Mask IP address (192.168.1.100 -> 192.168.XXX.XXX)
 */
export function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.XXX.XXX`;
  }
  // IPv6 - mask last half
  const v6Parts = ip.split(':');
  if (v6Parts.length >= 4) {
    return v6Parts.slice(0, 4).join(':') + ':XXXX:XXXX:XXXX:XXXX';
  }
  return 'XXX.XXX.XXX.XXX';
}

/**
 * Mask bank account for display
 */
export function maskBankAccount(account: string): string {
  if (!account || account.length < 4) return '****';
  return `****${account.slice(-4)}`;
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate CPF
 */
export function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cleaned[10]);
}

/**
 * Validate CNPJ
 */
export function isValidCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * weights1[i];
  let rest = sum % 11;
  if (parseInt(cleaned[12]) !== (rest < 2 ? 0 : 11 - rest)) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(cleaned[i]) * weights2[i];
  rest = sum % 11;
  return parseInt(cleaned[13]) === (rest < 2 ? 0 : 11 - rest);
}

/**
 * Validate CEP
 */
export function isValidCep(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

// ==================== STRING UTILITIES ====================

/**
 * Generate idempotency key for ledger entries
 */
export function generateIdempotencyKey(
  walletId: string,
  entryType: string,
  referenceId: string,
  timestamp?: Date
): string {
  const ts = (timestamp || new Date()).toISOString().slice(0, 10); // YYYY-MM-DD
  return `${walletId}:${entryType}:${referenceId}:${ts}`;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate correlation ID for audit trail
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

// ==================== GEO UTILITIES ====================

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
