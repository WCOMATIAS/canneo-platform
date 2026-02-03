import { Module } from '@nestjs/common';
import { PspWebhookController } from './psp-webhook.controller';
import { PspWebhookService } from './psp-webhook.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PspWebhookController],
  providers: [PspWebhookService],
})
export class PspModule {}
