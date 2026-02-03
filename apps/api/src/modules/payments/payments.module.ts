import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentsController } from './payments.controller';
import { PaymentIntentService } from './services/payment-intent.service';
import { LedgerService } from './services/ledger.service';
import { WalletService } from './services/wallet.service';
import { SplitService } from './services/split.service';
import { HoldService } from './services/hold.service';
import { HoldReleaseProcessor } from './jobs/hold-release.processor';
import { HoldReleaseScheduler } from './jobs/hold-release.scheduler';
import { PAYMENT_CONSTANTS } from './constants/payment.constants';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: PAYMENT_CONSTANTS.HOLD_RELEASE_QUEUE,
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentIntentService,
    LedgerService,
    WalletService,
    SplitService,
    HoldService,
    HoldReleaseProcessor,
    HoldReleaseScheduler,
  ],
  exports: [
    PaymentIntentService,
    LedgerService,
    WalletService,
    SplitService,
    HoldService,
  ],
})
export class PaymentsModule {}
