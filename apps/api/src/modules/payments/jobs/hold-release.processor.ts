import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HoldService } from '../services/hold.service';
import { PAYMENT_CONSTANTS } from '../constants/payment.constants';

export interface HoldReleaseJobData {
  batchId?: string;
}

@Processor(PAYMENT_CONSTANTS.HOLD_RELEASE_QUEUE)
export class HoldReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(HoldReleaseProcessor.name);

  constructor(private readonly holdService: HoldService) {
    super();
  }

  async process(job: Job<HoldReleaseJobData>): Promise<number> {
    this.logger.log(`Processing hold release job ${job.id}`);

    try {
      const releasedCount = await this.holdService.processHoldReleases();
      return releasedCount;
    } catch (error) {
      this.logger.error(
        `Error processing hold releases: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<HoldReleaseJobData>, result: number) {
    this.logger.log(
      `Hold release job ${job.id} completed. Released ${result} holds.`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<HoldReleaseJobData>, error: Error) {
    this.logger.error(
      `Hold release job ${job.id} failed: ${error.message}`,
    );
  }
}
