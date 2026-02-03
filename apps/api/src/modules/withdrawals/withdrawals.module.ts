import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalService, PayoutService } from './services';
import { WithdrawalProcessorJob } from './jobs/withdrawal-processor.job';
import { PrismaModule } from '../prisma';
import { AuditModule } from '../audit';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [WithdrawalsController],
  providers: [
    WithdrawalService,
    PayoutService,
    WithdrawalProcessorJob,
  ],
  exports: [WithdrawalService],
})
export class WithdrawalsModule {}
