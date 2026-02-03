export const TELEHEALTH_CONSTANTS = {
  // Daily.co
  DAILY_API_BASE_URL: 'https://api.daily.co/v1',
  DAILY_ROOM_PREFIX: 'canneo-',

  // Token TTL
  TOKEN_TTL_SECONDS: 3600, // 1 hora

  // Room settings
  DEFAULT_ROOM_EXPIRY_MINUTES: 180, // 3 horas após criação
  MAX_PARTICIPANTS: 2,

  // Recording
  RECORDING_BUCKET_PREFIX: 'recordings/',
  TRANSCRIPTION_BUCKET_PREFIX: 'transcriptions/',

  // Video session status
  SESSION_STATUS: {
    CREATED: 'CREATED',
    STARTED: 'STARTED',
    ENDED: 'ENDED',
    RECORDING_PROCESSING: 'RECORDING_PROCESSING',
    RECORDING_READY: 'RECORDING_READY',
  } as const,
} as const;

export type VideoSessionStatus =
  (typeof TELEHEALTH_CONSTANTS.SESSION_STATUS)[keyof typeof TELEHEALTH_CONSTANTS.SESSION_STATUS];
