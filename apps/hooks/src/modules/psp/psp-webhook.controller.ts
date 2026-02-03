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
import { PspWebhookService, PspWebhookEvent } from './psp-webhook.service';

@Controller('webhooks/psp')
export class PspWebhookController {
  private readonly logger = new Logger(PspWebhookController.name);

  constructor(private readonly pspWebhookService: PspWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-psp-signature') signature: string,
    @Body() event: PspWebhookEvent
  ): Promise<{ received: boolean }> {
    // Get raw body for signature verification
    const rawBody = req.rawBody?.toString() || JSON.stringify(event);

    // Verify signature
    if (!signature) {
      this.logger.warn('Missing webhook signature');
      throw new BadRequestException('Missing signature');
    }

    const isValid = this.pspWebhookService.verifySignature(rawBody, signature);

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    // Process event
    try {
      await this.pspWebhookService.processEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
      // Return 200 to prevent retries for non-retryable errors
      // In production, you might want to return 500 for retryable errors
      return { received: true };
    }
  }
}
