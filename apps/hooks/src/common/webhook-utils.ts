import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate hash for idempotency check
 */
export function generateEventHash(
  provider: string,
  eventId: string,
  eventType: string
): string {
  return createHash('sha256')
    .update(`${provider}:${eventId}:${eventType}`)
    .digest('hex');
}

/**
 * Mask sensitive data in webhook payload for logging
 */
export function maskSensitiveData(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const sensitiveKeys = [
    'card_number',
    'cvv',
    'password',
    'secret',
    'token',
    'cpf',
    'cnpj',
    'pix_key',
  ];

  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      masked[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
