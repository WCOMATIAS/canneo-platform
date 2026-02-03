import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DailyWebhookService } from './daily-webhook.service';

interface DailyWebhookPayload {
  event: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

@Controller('daily')
export class DailyWebhookController {
  private readonly logger = new Logger(DailyWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dailyWebhookService: DailyWebhookService,
  ) {
    this.webhookSecret = this.configService.get<string>('DAILY_WEBHOOK_SECRET', '');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: DailyWebhookPayload,
    @Headers('x-webhook-timestamp') timestamp: string,
    @Headers('x-webhook-signature') signature: string,
  ): Promise<{ received: boolean }> {
    // Verificar assinatura se configurada
    if (this.webhookSecret) {
      const isValid = this.verifySignature(body, timestamp, signature);
      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid signature');
      }
    }

    this.logger.log(`Daily webhook received: ${body.event}`);

    try {
      switch (body.event) {
        case 'meeting.started':
          await this.dailyWebhookService.handleMeetingStarted(
            body.payload as { room: string; meeting_id: string },
          );
          break;

        case 'meeting.ended':
          await this.dailyWebhookService.handleMeetingEnded(
            body.payload as { room: string; meeting_id: string; duration: number },
          );
          break;

        case 'recording.ready-to-download':
          await this.dailyWebhookService.handleRecordingReady(
            body.payload as {
              room_name: string;
              recording_id: string;
              download_link: string;
              duration: number;
            },
          );
          break;

        case 'transcription.ready':
          await this.dailyWebhookService.handleTranscriptionReady(
            body.payload as {
              room_name: string;
              transcription_id: string;
              download_link: string;
            },
          );
          break;

        default:
          this.logger.log(`Unhandled Daily event: ${body.event}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(
        `Error processing Daily webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private verifySignature(
    body: unknown,
    timestamp: string,
    signature: string,
  ): boolean {
    if (!signature || !timestamp) {
      return false;
    }

    const payload = `${timestamp}.${JSON.stringify(body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
