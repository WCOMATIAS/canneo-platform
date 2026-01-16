import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface DailyRoomResponse {
  id: string;
  name: string;
  url: string;
  created_at: string;
  privacy: string;
}

interface DailyTokenResponse {
  token: string;
}

@Injectable()
export class VideoService {
  private readonly dailyApiKey: string;
  private readonly dailyDomain: string;
  private readonly dailyApiUrl = 'https://api.daily.co/v1';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.dailyApiKey = this.configService.get<string>('DAILY_API_KEY') || '';
    this.dailyDomain = this.configService.get<string>('DAILY_DOMAIN') || '';
  }

  // ============================================================================
  // CREATE ROOM (for new consultations)
  // ============================================================================

  async createRoom(consultationId: string): Promise<DailyRoomResponse> {
    const roomName = `canneo-${consultationId.substring(0, 8)}-${Date.now()}`;

    const response = await fetch(`${this.dailyApiUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_knocking: true,
          enable_screenshare: true,
          enable_chat: true,
          enable_prejoin_ui: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          eject_at_room_exp: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Daily.co room creation failed:', error);
      throw new InternalServerErrorException('Erro ao criar sala de video');
    }

    return response.json();
  }

  // ============================================================================
  // GET VIDEO TOKEN (for joining a consultation)
  // ============================================================================

  async getVideoToken(
    consultationId: string,
    userId: string,
    organizationId: string,
  ): Promise<{ token: string; roomUrl: string }> {
    // Get consultation
    const consultation = await this.prisma.consultation.findFirst({
      where: {
        id: consultationId,
        organizationId,
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    // Check authorization - only doctor or patient can join
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    const isDoctor = user?.doctorProfile?.id === consultation.doctorId;
    const isPatientOwner = consultation.patient?.email && user?.email === consultation.patient.email;

    // For MVP: allow organization members to join as observers
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    if (!isDoctor && !isPatientOwner && !membership) {
      throw new ForbiddenException('Acesso nao autorizado a esta consulta');
    }

    // Create room if not exists
    let roomUrl = consultation.dailyRoomUrl;
    let roomName = consultation.dailyRoomName;

    if (!roomUrl || !roomName) {
      const room = await this.createRoom(consultationId);
      roomName = room.name;
      roomUrl = room.url;

      // Update consultation with room info
      await this.prisma.consultation.update({
        where: { id: consultationId },
        data: {
          dailyRoomName: roomName,
          dailyRoomUrl: roomUrl,
        },
      });
    }

    // Generate meeting token
    const token = await this.generateMeetingToken(roomName!, {
      userId,
      userName: user?.name || 'Participante',
      isOwner: isDoctor,
      expirationMinutes: consultation.duration + 30, // Extra 30 min buffer
    });

    return {
      token,
      roomUrl: roomUrl!,
    };
  }

  // ============================================================================
  // GENERATE MEETING TOKEN
  // ============================================================================

  private async generateMeetingToken(
    roomName: string,
    options: {
      userId: string;
      userName: string;
      isOwner: boolean;
      expirationMinutes: number;
    },
  ): Promise<string> {
    const expiration = Math.floor(Date.now() / 1000) + options.expirationMinutes * 60;

    const response = await fetch(`${this.dailyApiUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: options.userId,
          user_name: options.userName,
          is_owner: options.isOwner,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          exp: expiration,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Daily.co token generation failed:', error);
      throw new InternalServerErrorException('Erro ao gerar token de video');
    }

    const data: DailyTokenResponse = await response.json();
    return data.token;
  }

  // ============================================================================
  // DELETE ROOM (cleanup after consultation)
  // ============================================================================

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await fetch(`${this.dailyApiUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
        },
      });
    } catch (error) {
      console.error('Error deleting Daily.co room:', error);
      // Don't throw - cleanup failure shouldn't break the flow
    }
  }

  // ============================================================================
  // GET ROOM INFO
  // ============================================================================

  async getRoomInfo(roomName: string): Promise<DailyRoomResponse | null> {
    const response = await fetch(`${this.dailyApiUrl}/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.dailyApiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new InternalServerErrorException('Erro ao obter info da sala');
    }

    return response.json();
  }
}
