import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SlotsService } from '../services/slots.service';
import { AppointmentsService } from '../services/appointments.service';
import { SCHEDULING_CONSTANTS } from '../constants/scheduling.constants';

@Processor(SCHEDULING_CONSTANTS.SLOT_EXPIRATION_QUEUE)
export class SlotExpirationProcessor extends WorkerHost {
  private readonly logger = new Logger(SlotExpirationProcessor.name);

  constructor(
    private readonly slotsService: SlotsService,
    private readonly appointmentsService: AppointmentsService,
  ) {
    super();
  }

  async process(job: Job): Promise<number> {
    this.logger.log(`Processing slot expiration job ${job.id}`);

    try {
      // Buscar reservas expiradas
      const expiredAppointmentIds =
        await this.slotsService.processExpiredReservations();

      // Cancelar appointments correspondentes
      for (const appointmentId of expiredAppointmentIds) {
        try {
          await this.appointmentsService.onPaymentFailedOrExpired(appointmentId);
        } catch (error) {
          this.logger.error(
            `Failed to cancel appointment ${appointmentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return expiredAppointmentIds.length;
    } catch (error) {
      this.logger.error(
        `Error processing slot expirations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: number) {
    if (result > 0) {
      this.logger.log(
        `Slot expiration job ${job.id} completed. Expired ${result} reservations.`,
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Slot expiration job ${job.id} failed: ${error.message}`);
  }
}
