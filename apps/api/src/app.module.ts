import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma';
import { AuthModule, JwtAuthGuard, RolesGuard, MfaGuard } from './modules/auth';
import { PaymentsModule } from './modules/payments';
import { SchedulingModule } from './modules/scheduling';
import { TelehealthModule } from './modules/telehealth';
import { StorageModule } from './modules/storage';
import { RecordsModule } from './modules/records';
import { PrescriptionsModule } from './modules/prescriptions';
import { PharmacyModule } from './modules/pharmacy';
import { AuditModule } from './modules/audit';
import { WithdrawalsModule } from './modules/withdrawals';
import { ShippingModule } from './modules/shipping';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    PrismaModule,
    AuthModule,
    PaymentsModule,
    SchedulingModule,
    TelehealthModule,
    StorageModule,
    RecordsModule,
    PrescriptionsModule,
    PharmacyModule,
    AuditModule,
    WithdrawalsModule,
    ShippingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MfaGuard,
    },
  ],
})
export class AppModule {}
