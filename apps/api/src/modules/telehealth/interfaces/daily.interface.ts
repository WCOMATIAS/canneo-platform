export interface DailyRoomConfig {
  name: string;
  privacy: 'private' | 'public';
  properties: {
    exp?: number;
    max_participants?: number;
    enable_recording?: 'cloud' | 'local' | false;
    enable_transcription?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    lang?: string;
  };
}

export interface DailyRoom {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: {
    exp?: number;
    max_participants?: number;
    enable_recording?: string;
    enable_transcription?: boolean;
  };
}

export interface DailyMeetingToken {
  token: string;
}

export interface DailyMeetingTokenConfig {
  room_name: string;
  exp?: number;
  is_owner?: boolean;
  user_name?: string;
  user_id?: string;
  enable_recording?: 'cloud' | 'local' | false;
  start_video_off?: boolean;
  start_audio_off?: boolean;
  enable_screenshare?: boolean;
}

export interface DailyWebhookEvent {
  event: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface DailyMeetingStartedPayload {
  room: string;
  meeting_id: string;
}

export interface DailyMeetingEndedPayload {
  room: string;
  meeting_id: string;
  duration: number;
}

export interface DailyRecordingReadyPayload {
  room_name: string;
  recording_id: string;
  download_link: string;
  duration: number;
  s3_key?: string;
}

export interface DailyTranscriptionReadyPayload {
  room_name: string;
  transcription_id: string;
  download_link: string;
  text?: string;
}
