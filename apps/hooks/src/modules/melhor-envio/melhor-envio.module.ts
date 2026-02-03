import { Module } from '@nestjs/common';
import { MelhorEnvioWebhookController } from './melhor-envio-webhook.controller';
import { MelhorEnvioWebhookService } from './melhor-envio-webhook.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MelhorEnvioWebhookController],
  providers: [MelhorEnvioWebhookService],
})
export class MelhorEnvioModule {}
