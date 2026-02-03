import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SCHEDULING_CONSTANTS } from '../constants/scheduling.constants';

@Injectable()
export class SchedulingScheduler implements OnModuleInit {
  private readonly logger = new Logger(SchedulingScheduler.name);

  constructor(
    @InjectQueue(SCHEDULING_CONSTANTS.SLOT_EXPIRATION_QUEUE)
    private readonly slotExpirationQueue: Queue,

    @InjectQueue(SCHEDULING_CONSTANTS.APPOINTMENT_REMINDER_QUEUE)
    private readonly reminderQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.setupSlotExpirationJob();
    await this.setupReminderJob();
  }

  private async setupSlotExpirationJob() {
    // Remover jobs repetidos existentes
    const repeatableJobs = await this.slotExpirationQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.slotExpirationQueue.removeRepeatableByKey(job.key);
    }

    // Adicionar job repetido a cada minuto
    await this.slotExpirationQueue.add(
      'check-expired-slots',
      {},
      {
        repeat: {
          pattern: SCHEDULING_CONSTANTS.SLOT_EXPIRATION_CRON,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log('Slot expiration scheduler initialized (every minute)');
  }

  private async setupReminderJob() {
    // Remover jobs repetidos existentes
    const repeatableJobs = await this.reminderQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.reminderQueue.removeRepeatableByKey(job.key);
    }

    // Adicionar job repetido a cada hora
    await this.reminderQueue.add(
      'check-reminders',
      { type: 'check' },
      {
        repeat: {
          pattern: SCHEDULING_CONSTANTS.REMINDER_CHECK_CRON,
        },
        removeOnComplete: 24,
        removeOnFail: 10,
      },
    );

    this.logger.log('Appointment reminder scheduler initialized (every hour)');
  }

  /**
   * Força verificação de slots expirados
   */
  async triggerSlotExpirationNow(): Promise<string> {
    const job = await this.slotExpirationQueue.add(
      'check-expired-slots',
      {},
      { removeOnComplete: true },
    );
    return job.id ?? 'unknown';
  }

  /**
   * Força verificação de lembretes
   */
  async triggerReminderCheckNow(): Promise<string> {
    const job = await this.reminderQueue.add(
      'check-reminders',
      { type: 'check' },
      { removeOnComplete: true },
    );
    return job.id ?? 'unknown';
  }
}
