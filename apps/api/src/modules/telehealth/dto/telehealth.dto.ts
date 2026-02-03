import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateVideoSessionDto {
  @ApiProperty({ description: 'ID do agendamento' })
  @IsUUID()
  appointmentId: string;

  @ApiPropertyOptional({ description: 'Habilitar gravação (requer consentimento)' })
  @IsOptional()
  @IsBoolean()
  enableRecording?: boolean;

  @ApiPropertyOptional({ description: 'Habilitar transcrição (requer consentimento)' })
  @IsOptional()
  @IsBoolean()
  enableTranscription?: boolean;
}

export class VideoSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appointmentId: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  roomName: string;

  @ApiProperty()
  roomUrl: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  recordingEnabled: boolean;

  @ApiProperty()
  transcriptionEnabled: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class MeetingTokenResponseDto {
  @ApiProperty({ description: 'Token JWT para acesso à sala Daily' })
  token: string;

  @ApiProperty({ description: 'URL da sala' })
  roomUrl: string;

  @ApiProperty({ description: 'Timestamp de expiração (Unix)' })
  expiresAt: number;
}

export class ConsentRecordingDto {
  @ApiProperty({ description: 'ID da sessão de vídeo' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Consentimento para gravação' })
  @IsBoolean()
  consentRecording: boolean;

  @ApiProperty({ description: 'Consentimento para transcrição' })
  @IsBoolean()
  consentTranscription: boolean;
}

export class EndSessionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  duration?: number;
}
