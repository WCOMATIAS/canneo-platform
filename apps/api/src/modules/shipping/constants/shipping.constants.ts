// Shipping module constants

import { ShipmentStatus } from '@prisma/client';

/**
 * Shipping provider
 */
export const SHIPPING_PROVIDER = 'MELHOR_ENVIO';

/**
 * Melhor Envio API base URLs
 */
export const MELHOR_ENVIO_URLS = {
  SANDBOX: 'https://sandbox.melhorenvio.com.br/api/v2',
  PRODUCTION: 'https://melhorenvio.com.br/api/v2',
} as const;

/**
 * Melhor Envio supported services
 */
export const MELHOR_ENVIO_SERVICES = {
  CORREIOS_PAC: 1,
  CORREIOS_SEDEX: 2,
  JADLOG_PACKAGE: 3,
  JADLOG_COM: 4,
  AZUL_AMANHA: 15,
  AZUL_ECOMMERCE: 16,
  LATAM_JUNTOS: 17,
} as const;

/**
 * Valid state transitions for shipments
 */
export const SHIPMENT_STATE_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  QUOTE_CREATED: ['LABEL_CREATED'],
  LABEL_CREATED: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RETURNED'],
  DELIVERED: [],
  FAILED: ['LABEL_CREATED'], // Can retry
  RETURNED: [],
};

/**
 * Check if a state transition is valid
 */
export function isValidShipmentTransition(
  from: ShipmentStatus,
  to: ShipmentStatus
): boolean {
  return SHIPMENT_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Default package dimensions (for quotes when not specified)
 */
export const DEFAULT_PACKAGE = {
  height: 10, // cm
  width: 15, // cm
  length: 20, // cm
  weight: 0.5, // kg
} as const;
