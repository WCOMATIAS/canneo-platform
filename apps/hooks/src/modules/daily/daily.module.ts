import { Module } from '@nestjs/common';
import { DailyWebhookController } from './daily-webhook.controller';
import { DailyWebhookService } from './daily-webhook.service';

@Module({
  controllers: [DailyWebhookController],
  providers: [DailyWebhookService],
  exports: [DailyWebhookService],
})
export class DailyModule {}
