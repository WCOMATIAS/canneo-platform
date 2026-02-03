import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma';
import { DailyModule } from './modules/daily';
import { PspModule } from './modules/psp';
import { MelhorEnvioModule } from './modules/melhor-envio';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting for webhooks
    ThrottlerModule.forRoot([
      {
        name: 'webhook',
        ttl: 1000,
        limit: 100, // 100 requests per second
      },
    ]),

    PrismaModule,
    DailyModule,
    PspModule,
    MelhorEnvioModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
