import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TELEHEALTH_CONSTANTS } from '../constants/telehealth.constants';
import {
  DailyRoom,
  DailyRoomConfig,
  DailyMeetingToken,
  DailyMeetingTokenConfig,
} from '../interfaces/daily.interface';

@Injectable()
export class DailyService {
  private readonly logger = new Logger(DailyService.name);
  private readonly apiKey: string;
  private readonly domain: string;
  private readonly baseUrl = TELEHEALTH_CONSTANTS.DAILY_API_BASE_URL;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DAILY_API_KEY', '');
    this.domain = this.configService.get<string>('DAILY_DOMAIN', '');

    if (!this.apiKey) {
      this.logger.warn('DAILY_API_KEY not configured');
    }
  }

  /**
   * Cria uma sala Daily.co para uma consulta
   *
   * REGRA: API Key NUNCA exposta no frontend
   */
  async createRoom(
    appointmentId: string,
    options?: {
      enableRecording?: boolean;
      enableTranscription?: boolean;
    },
  ): Promise<DailyRoom> {
    const roomName = `${TELEHEALTH_CONSTANTS.DAILY_ROOM_PREFIX}${appointmentId}`;

    // Expiração: 3 horas após criação
    const exp = Math.floor(Date.now() / 1000) +
      TELEHEALTH_CONSTANTS.DEFAULT_ROOM_EXPIRY_MINUTES * 60;

    const roomConfig: DailyRoomConfig = {
      name: roomName,
      privacy: 'private',
      properties: {
        exp,
        max_participants: TELEHEALTH_CONSTANTS.MAX_PARTICIPANTS,
        enable_recording: options?.enableRecording ? 'cloud' : false,
        enable_transcription: options?.enableTranscription ?? false,
        start_video_off: false,
        start_audio_off: false,
        enable_chat: true,
        enable_knocking: true,
        lang: 'pt',
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(roomConfig),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to create Daily room: ${error}`);
        throw new InternalServerErrorException('Failed to create video room');
      }

      const room: DailyRoom = await response.json();

      this.logger.log(
        `Daily room created: ${room.name} (${room.url}) for appointment ${appointmentId}`,
      );

      return room;
    } catch (error) {
      this.logger.error(
        `Error creating Daily room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Failed to create video room');
    }
  }

  /**
   * Gera token de acesso para uma sala
   *
   * REGRA: Token com escopo por room, TTL 1h
   */
  async getMeetingToken(
    roomName: string,
    userId: string,
    userName: string,
    isOwner: boolean,
    options?: {
      enableRecording?: boolean;
    },
  ): Promise<{ token: string; expiresAt: number }> {
    const exp = Math.floor(Date.now() / 1000) + TELEHEALTH_CONSTANTS.TOKEN_TTL_SECONDS;

    const tokenConfig: DailyMeetingTokenConfig = {
      room_name: roomName,
      exp,
      is_owner: isOwner,
      user_name: userName,
      user_id: userId,
      enable_recording: options?.enableRecording ? 'cloud' : false,
      start_video_off: false,
      start_audio_off: false,
      enable_screenshare: isOwner, // Apenas médico pode compartilhar tela
    };

    try {
      const response = await fetch(`${this.baseUrl}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(tokenConfig),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to create meeting token: ${error}`);
        throw new InternalServerErrorException('Failed to create meeting token');
      }

      const data: DailyMeetingToken = await response.json();

      this.logger.log(
        `Meeting token created for user ${userId} in room ${roomName}`,
      );

      return {
        token: data.token,
        expiresAt: exp,
      };
    } catch (error) {
      this.logger.error(
        `Error creating meeting token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Failed to create meeting token');
    }
  }

  /**
   * Obtém informações de uma sala
   */
  async getRoom(roomName: string): Promise<DailyRoom | null> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to get Daily room: ${error}`);
        return null;
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `Error getting Daily room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Deleta uma sala
   */
  async deleteRoom(roomName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        const error = await response.text();
        this.logger.error(`Failed to delete Daily room: ${error}`);
        return false;
      }

      this.logger.log(`Daily room deleted: ${roomName}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting Daily room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Atualiza configurações de uma sala
   */
  async updateRoom(
    roomName: string,
    updates: Partial<DailyRoomConfig['properties']>,
  ): Promise<DailyRoom | null> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ properties: updates }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to update Daily room: ${error}`);
        return null;
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `Error updating Daily room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Download de gravação
   */
  async getRecordingDownloadLink(recordingId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/recordings/${recordingId}/access-link`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.download_link;
    } catch (error) {
      this.logger.error(
        `Error getting recording link: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Gera URL pública da sala
   */
  getRoomUrl(roomName: string): string {
    return `https://${this.domain}.daily.co/${roomName}`;
  }
}
