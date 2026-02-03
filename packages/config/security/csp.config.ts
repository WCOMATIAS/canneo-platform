/**
 * Content Security Policy (CSP) Configuration for CANNEO Portals
 *
 * IMPORTANTE: Daily.co requer configurações específicas de CSP
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'media-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests'?: boolean;
}

const baseCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-src': ["'self'"],
  'media-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': true,
};

/**
 * CSP para portais com telemedicina (médico e paciente)
 * Inclui permissões para Daily.co
 */
export const telehealthCSP: CSPDirectives = {
  ...baseCSP,
  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_API_URL || 'https://api.canneo.com.br',
    process.env.NEXT_PUBLIC_WS_URL || 'wss://api.canneo.com.br',
    // Daily.co
    'https://*.daily.co',
    'wss://*.daily.co',
    'https://api.daily.co',
  ],
  'frame-src': [
    "'self'",
    // Daily.co embed
    'https://*.daily.co',
  ],
  'media-src': [
    "'self'",
    'blob:',
    // Daily.co media streams
    'https://*.daily.co',
  ],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    // Daily.co SDK
    'https://*.daily.co',
  ],
};

/**
 * CSP para portal admin (sem telemedicina)
 */
export const adminCSP: CSPDirectives = {
  ...baseCSP,
  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_API_URL || 'https://api.canneo.com.br',
  ],
};

/**
 * CSP para portal farmácia (sem telemedicina)
 */
export const pharmacyCSP: CSPDirectives = {
  ...baseCSP,
  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_API_URL || 'https://api.canneo.com.br',
  ],
};

/**
 * Converte objeto CSP para string de header
 */
export function cspToString(csp: CSPDirectives): string {
  const directives: string[] = [];

  for (const [key, value] of Object.entries(csp)) {
    if (key === 'upgrade-insecure-requests' && value === true) {
      directives.push('upgrade-insecure-requests');
    } else if (Array.isArray(value)) {
      directives.push(`${key} ${value.join(' ')}`);
    }
  }

  return directives.join('; ');
}

/**
 * Headers de segurança padrão
 */
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(self)',
  },
];

/**
 * Exemplo de uso em next.config.js:
 *
 * const { telehealthCSP, cspToString, securityHeaders } = require('@canneo/config/security/csp.config');
 *
 * module.exports = {
 *   async headers() {
 *     return [
 *       {
 *         source: '/:path*',
 *         headers: [
 *           ...securityHeaders,
 *           {
 *             key: 'Content-Security-Policy',
 *             value: cspToString(telehealthCSP),
 *           },
 *         ],
 *       },
 *     ];
 *   },
 * };
 */
