import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PAYMENT_CONSTANTS } from '../constants/payment.constants';

@Injectable()
export class HoldReleaseScheduler implements OnModuleInit {
  private readonly logger = new Logger(HoldReleaseScheduler.name);

  constructor(
    @InjectQueue(PAYMENT_CONSTANTS.HOLD_RELEASE_QUEUE)
    private readonly holdReleaseQueue: Queue,
  ) {}

  async onModuleInit() {
    // Remover jobs repetidos existentes
    const repeatableJobs = await this.holdReleaseQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.holdReleaseQueue.removeRepeatableByKey(job.key);
    }

    // Adicionar job repetido a cada minuto
    await this.holdReleaseQueue.add(
      'process-holds',
      { batchId: 'scheduled' },
      {
        repeat: {
          pattern: PAYMENT_CONSTANTS.HOLD_RELEASE_CRON,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log('Hold release scheduler initialized (every minute)');
  }

  /**
   * Força processamento imediato de holds
   */
  async triggerNow(): Promise<string> {
    const job = await this.holdReleaseQueue.add(
      'process-holds',
      { batchId: `manual-${Date.now()}` },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Manual hold release triggered: ${job.id}`);
    return job.id ?? 'unknown';
  }
}
