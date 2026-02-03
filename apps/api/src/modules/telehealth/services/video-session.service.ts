import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConsentType, AppointmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DailyService } from './daily.service';
import { TELEHEALTH_CONSTANTS } from '../constants/telehealth.constants';
import {
  VideoSessionResponseDto,
  MeetingTokenResponseDto,
} from '../dto/telehealth.dto';

@Injectable()
export class VideoSessionService {
  private readonly logger = new Logger(VideoSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyService: DailyService,
  ) {}

  /**
   * Cria sessão de vídeo para um appointment
   *
   * REGRA: Room criada por consulta no backend
   */
  async createSession(
    appointmentId: string,
    options?: {
      enableRecording?: boolean;
      enableTranscription?: boolean;
    },
  ): Promise<VideoSessionResponseDto> {
    // Verificar se appointment existe e está CONFIRMED ou IN_PROGRESS
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        videoSession: true,
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment ${appointmentId} not found`);
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        `Cannot create video session for appointment in status ${appointment.status}`,
      );
    }

    // Se já existe sessão, retorná-la
    if (appointment.videoSession) {
      return this.mapToResponse(appointment.videoSession);
    }

    // Verificar consentimentos se gravação/transcrição habilitadas
    if (options?.enableRecording || options?.enableTranscription) {
      await this.verifyConsents(
        appointment.patient.userId,
        options.enableRecording ?? false,
        options.enableTranscription ?? false,
      );
    }

    // Criar sala no Daily
    const room = await this.dailyService.createRoom(appointmentId, options);

    // Criar registro no banco
    const session = await this.prisma.videoSession.create({
      data: {
        appointmentId,
        provider: 'DAILY',
        roomName: room.name,
        roomUrl: room.url,
        status: TELEHEALTH_CONSTANTS.SESSION_STATUS.CREATED,
        recordingEnabled: options?.enableRecording ?? false,
        transcriptionEnabled: options?.enableTranscription ?? false,
      },
    });

    this.logger.log(
      `Video session created: ${session.id} for appointment ${appointmentId}`,
    );

    return this.mapToResponse(session);
  }

  /**
   * Obtém token de acesso para a sessão
   *
   * REGRA: Token com escopo por room, TTL 1h
   */
  async getMeetingToken(
    sessionId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<MeetingTokenResponseDto> {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Video session ${sessionId} not found`);
    }

    // Verificar permissão
    const appointment = session.appointment;
    const isDoctor = appointment.doctor.userId === userId;
    const isPatient = appointment.patient.userId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isDoctor && !isPatient && !isAdmin) {
      throw new ForbiddenException('Not authorized to join this session');
    }

    // Determinar se é owner (médico é owner)
    const isOwner = isDoctor;

    // Determinar nome do usuário
    const userName = isDoctor
      ? `Dr. ${appointment.doctor.user.fullName}`
      : appointment.patient.user.fullName;

    // Gerar token
    const { token, expiresAt } = await this.dailyService.getMeetingToken(
      session.roomName,
      userId,
      userName,
      isOwner,
      { enableRecording: session.recordingEnabled },
    );

    return {
      token,
      roomUrl: session.roomUrl,
      expiresAt,
    };
  }

  /**
   * Finaliza sessão de vídeo
   */
  async endSession(sessionId: string): Promise<void> {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Video session ${sessionId} not found`);
    }

    // Deletar sala no Daily
    await this.dailyService.deleteRoom(session.roomName);

    // Atualizar status
    await this.prisma.videoSession.update({
      where: { id: sessionId },
      data: { status: TELEHEALTH_CONSTANTS.SESSION_STATUS.ENDED },
    });

    this.logger.log(`Video session ended: ${sessionId}`);
  }

  /**
   * Atualiza status da sessão (chamado por webhook)
   */
  async updateSessionStatus(
    roomName: string,
    status: string,
    meetingId?: string,
  ): Promise<void> {
    await this.prisma.videoSession.updateMany({
      where: { roomName },
      data: {
        status,
        meetingId,
      },
    });

    this.logger.log(`Video session status updated: ${roomName} -> ${status}`);
  }

  /**
   * Salva URL da gravação (chamado por webhook)
   */
  async saveRecordingUrl(roomName: string, recordingUrl: string): Promise<void> {
    await this.prisma.videoSession.updateMany({
      where: { roomName },
      data: {
        recordingUrl,
        status: TELEHEALTH_CONSTANTS.SESSION_STATUS.RECORDING_READY,
      },
    });

    this.logger.log(`Recording saved for session: ${roomName}`);
  }

  /**
   * Salva transcrição (chamado por webhook)
   */
  async saveTranscription(
    roomName: string,
    transcriptionUrl: string,
    transcriptionText?: string,
  ): Promise<void> {
    await this.prisma.videoSession.updateMany({
      where: { roomName },
      data: {
        transcriptionUrl,
        transcriptionText,
      },
    });

    this.logger.log(`Transcription saved for session: ${roomName}`);
  }

  /**
   * Obtém sessão por appointment ID
   */
  async getSessionByAppointmentId(
    appointmentId: string,
  ): Promise<VideoSessionResponseDto | null> {
    const session = await this.prisma.videoSession.findUnique({
      where: { appointmentId },
    });

    if (!session) {
      return null;
    }

    return this.mapToResponse(session);
  }

  /**
   * Obtém sessão por ID
   */
  async getSessionById(sessionId: string): Promise<VideoSessionResponseDto> {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Video session ${sessionId} not found`);
    }

    return this.mapToResponse(session);
  }

  /**
   * Registra consentimentos para gravação/transcrição
   */
  async recordConsents(
    userId: string,
    sessionId: string,
    consentRecording: boolean,
    consentTranscription: boolean,
  ): Promise<void> {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: { appointment: true },
    });

    if (!session) {
      throw new NotFoundException(`Video session ${sessionId} not found`);
    }

    const consentsToCreate = [];

    if (consentRecording) {
      consentsToCreate.push({
        userId,
        tenantId: session.appointment.tenantId,
        type: ConsentType.RECORDING,
        version: '1.0',
      });
    }

    if (consentTranscription) {
      consentsToCreate.push({
        userId,
        tenantId: session.appointment.tenantId,
        type: ConsentType.TRANSCRIPTION,
        version: '1.0',
      });
    }

    if (consentsToCreate.length > 0) {
      await this.prisma.consent.createMany({
        data: consentsToCreate,
      });
    }

    // Atualizar sessão se necessário
    if (consentRecording && !session.recordingEnabled) {
      await this.prisma.videoSession.update({
        where: { id: sessionId },
        data: { recordingEnabled: true },
      });

      // Atualizar sala no Daily para habilitar gravação
      await this.dailyService.updateRoom(session.roomName, {
        enable_recording: 'cloud',
      });
    }

    if (consentTranscription && !session.transcriptionEnabled) {
      await this.prisma.videoSession.update({
        where: { id: sessionId },
        data: { transcriptionEnabled: true },
      });

      await this.dailyService.updateRoom(session.roomName, {
        enable_transcription: true,
      });
    }

    this.logger.log(
      `Consents recorded for user ${userId} in session ${sessionId}`,
    );
  }

  /**
   * Verifica se usuário tem consentimentos necessários
   */
  private async verifyConsents(
    userId: string,
    requiresRecording: boolean,
    requiresTranscription: boolean,
  ): Promise<void> {
    if (!requiresRecording && !requiresTranscription) {
      return;
    }

    const types: ConsentType[] = [];
    if (requiresRecording) types.push(ConsentType.RECORDING);
    if (requiresTranscription) types.push(ConsentType.TRANSCRIPTION);

    const consents = await this.prisma.consent.findMany({
      where: {
        userId,
        type: { in: types },
        revokedAt: null,
      },
    });

    const hasRecordingConsent = consents.some(
      (c) => c.type === ConsentType.RECORDING,
    );
    const hasTranscriptionConsent = consents.some(
      (c) => c.type === ConsentType.TRANSCRIPTION,
    );

    if (requiresRecording && !hasRecordingConsent) {
      throw new BadRequestException(
        'Recording requires user consent. Please record consent first.',
      );
    }

    if (requiresTranscription && !hasTranscriptionConsent) {
      throw new BadRequestException(
        'Transcription requires user consent. Please record consent first.',
      );
    }
  }

  private mapToResponse(session: {
    id: string;
    appointmentId: string;
    provider: string;
    roomName: string;
    roomUrl: string;
    status: string;
    recordingEnabled: boolean;
    transcriptionEnabled: boolean;
    createdAt: Date;
  }): VideoSessionResponseDto {
    return {
      id: session.id,
      appointmentId: session.appointmentId,
      provider: session.provider,
      roomName: session.roomName,
      roomUrl: session.roomUrl,
      status: session.status,
      recordingEnabled: session.recordingEnabled,
      transcriptionEnabled: session.transcriptionEnabled,
      createdAt: session.createdAt,
    };
  }
}
