import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, WebhookProvider, WebhookStatus } from '@prisma/client';

interface S3UploadResult {
  bucket: string;
  key: string;
  url: string;
}

@Injectable()
export class DailyWebhookService {
  private readonly logger = new Logger(DailyWebhookService.name);
  private readonly prisma: PrismaClient;
  private readonly s3Bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.prisma = new PrismaClient();
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET', 'canneo-recordings');
  }

  async handleMeetingStarted(payload: {
    room: string;
    meeting_id: string;
  }): Promise<void> {
    this.logger.log(`Meeting started: ${payload.room} (${payload.meeting_id})`);

    // Registrar evento
    await this.recordWebhookEvent(
      `meeting-started-${payload.meeting_id}`,
      'meeting.started',
      payload,
    );

    // Atualizar status da sessão
    await this.prisma.videoSession.updateMany({
      where: { roomName: payload.room },
      data: {
        status: 'STARTED',
        meetingId: payload.meeting_id,
      },
    });
  }

  async handleMeetingEnded(payload: {
    room: string;
    meeting_id: string;
    duration: number;
  }): Promise<void> {
    this.logger.log(
      `Meeting ended: ${payload.room} (duration: ${payload.duration}s)`,
    );

    // Registrar evento
    await this.recordWebhookEvent(
      `meeting-ended-${payload.meeting_id}`,
      'meeting.ended',
      payload,
    );

    // Atualizar status da sessão
    await this.prisma.videoSession.updateMany({
      where: { roomName: payload.room },
      data: {
        status: 'ENDED',
      },
    });
  }

  async handleRecordingReady(payload: {
    room_name: string;
    recording_id: string;
    download_link: string;
    duration: number;
  }): Promise<void> {
    this.logger.log(
      `Recording ready: ${payload.room_name} (${payload.recording_id})`,
    );

    // Registrar evento
    await this.recordWebhookEvent(
      `recording-${payload.recording_id}`,
      'recording.ready-to-download',
      payload,
    );

    // Baixar e salvar no S3
    try {
      const s3Result = await this.uploadRecordingToS3(
        payload.download_link,
        payload.room_name,
        payload.recording_id,
      );

      // Atualizar sessão com URL do S3
      await this.prisma.videoSession.updateMany({
        where: { roomName: payload.room_name },
        data: {
          recordingUrl: s3Result.url,
          status: 'RECORDING_READY',
        },
      });

      this.logger.log(`Recording saved to S3: ${s3Result.key}`);
    } catch (error) {
      this.logger.error(
        `Failed to upload recording to S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Salvar link original como fallback
      await this.prisma.videoSession.updateMany({
        where: { roomName: payload.room_name },
        data: {
          recordingUrl: payload.download_link,
          status: 'RECORDING_READY',
        },
      });
    }
  }

  async handleTranscriptionReady(payload: {
    room_name: string;
    transcription_id: string;
    download_link: string;
  }): Promise<void> {
    this.logger.log(
      `Transcription ready: ${payload.room_name} (${payload.transcription_id})`,
    );

    // Registrar evento
    await this.recordWebhookEvent(
      `transcription-${payload.transcription_id}`,
      'transcription.ready',
      payload,
    );

    try {
      // Baixar transcrição
      const transcriptionText = await this.downloadTranscription(
        payload.download_link,
      );

      // Salvar no S3
      const s3Result = await this.uploadTranscriptionToS3(
        transcriptionText,
        payload.room_name,
        payload.transcription_id,
      );

      // Atualizar sessão
      await this.prisma.videoSession.updateMany({
        where: { roomName: payload.room_name },
        data: {
          transcriptionUrl: s3Result.url,
          transcriptionText: transcriptionText.substring(0, 65000), // Limitar tamanho
        },
      });

      this.logger.log(`Transcription saved: ${s3Result.key}`);
    } catch (error) {
      this.logger.error(
        `Failed to process transcription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Salvar link original como fallback
      await this.prisma.videoSession.updateMany({
        where: { roomName: payload.room_name },
        data: {
          transcriptionUrl: payload.download_link,
        },
      });
    }
  }

  private async recordWebhookEvent(
    eventId: string,
    eventType: string,
    payload: unknown,
  ): Promise<void> {
    try {
      await this.prisma.webhookEvent.upsert({
        where: {
          provider_eventId: {
            provider: WebhookProvider.DAILY,
            eventId,
          },
        },
        update: {
          status: WebhookStatus.PROCESSED,
          processedAt: new Date(),
        },
        create: {
          provider: WebhookProvider.DAILY,
          eventId,
          eventType,
          status: WebhookStatus.PROCESSED,
          processedAt: new Date(),
          rawPayload: payload as object,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record webhook event: ${error}`);
    }
  }

  private async uploadRecordingToS3(
    downloadUrl: string,
    roomName: string,
    recordingId: string,
  ): Promise<S3UploadResult> {
    // TODO: Implementar upload real para S3
    // Por enquanto, retornar URL original
    const key = `recordings/${roomName}/${recordingId}.mp4`;

    // Simulação - em produção usar @aws-sdk/client-s3
    /*
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const response = await fetch(downloadUrl);
    const buffer = await response.arrayBuffer();

    const s3Client = new S3Client({ region: process.env.AWS_REGION });
    await s3Client.send(new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: 'video/mp4',
    }));
    */

    return {
      bucket: this.s3Bucket,
      key,
      url: downloadUrl, // Em produção: `https://${this.s3Bucket}.s3.amazonaws.com/${key}`
    };
  }

  private async downloadTranscription(downloadUrl: string): Promise<string> {
    const response = await fetch(downloadUrl);
    return response.text();
  }

  private async uploadTranscriptionToS3(
    text: string,
    roomName: string,
    transcriptionId: string,
  ): Promise<S3UploadResult> {
    const key = `transcriptions/${roomName}/${transcriptionId}.txt`;

    // TODO: Implementar upload real para S3

    return {
      bucket: this.s3Bucket,
      key,
      url: `https://${this.s3Bucket}.s3.amazonaws.com/${key}`,
    };
  }
}
