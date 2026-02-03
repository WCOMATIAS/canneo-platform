import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { SchedulingController } from './scheduling.controller';
import { DoctorsService } from './services/doctors.service';
import { SlotsService } from './services/slots.service';
import { AppointmentsService } from './services/appointments.service';
import { SlotExpirationProcessor } from './jobs/slot-expiration.processor';
import { AppointmentReminderProcessor } from './jobs/appointment-reminder.processor';
import { SchedulingScheduler } from './jobs/scheduling.scheduler';
import { SCHEDULING_CONSTANTS } from './constants/scheduling.constants';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PaymentsModule,
    BullModule.registerQueue(
      { name: SCHEDULING_CONSTANTS.SLOT_EXPIRATION_QUEUE },
      { name: SCHEDULING_CONSTANTS.APPOINTMENT_REMINDER_QUEUE },
    ),
  ],
  controllers: [SchedulingController],
  providers: [
    DoctorsService,
    SlotsService,
    AppointmentsService,
    SlotExpirationProcessor,
    AppointmentReminderProcessor,
    SchedulingScheduler,
  ],
  exports: [DoctorsService, SlotsService, AppointmentsService],
})
export class SchedulingModule {}
