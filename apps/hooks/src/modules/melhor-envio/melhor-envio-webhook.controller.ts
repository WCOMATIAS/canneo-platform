import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { MelhorEnvioWebhookService, MelhorEnvioWebhookEvent } from './melhor-envio-webhook.service';

@Controller('webhooks/melhor-envio')
export class MelhorEnvioWebhookController {
  private readonly logger = new Logger(MelhorEnvioWebhookController.name);

  constructor(
    private readonly melhorEnvioWebhookService: MelhorEnvioWebhookService
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature') signature: string,
    @Body() event: MelhorEnvioWebhookEvent
  ): Promise<{ received: boolean }> {
    // Get raw body for signature verification
    const rawBody = req.rawBody?.toString() || JSON.stringify(event);

    // Verify signature if provided
    if (signature) {
      const isValid = this.melhorEnvioWebhookService.verifySignature(rawBody, signature);

      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid signature');
      }
    }

    // Process event
    try {
      await this.melhorEnvioWebhookService.processEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return { received: true };
    }
  }
}
