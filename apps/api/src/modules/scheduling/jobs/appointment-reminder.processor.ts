import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SCHEDULING_CONSTANTS } from '../constants/scheduling.constants';

interface ReminderJobData {
  type: 'check' | 'send';
  appointmentId?: string;
  hoursBeforeType?: number;
}

@Processor(SCHEDULING_CONSTANTS.APPOINTMENT_REMINDER_QUEUE)
export class AppointmentReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(AppointmentReminderProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ReminderJobData>): Promise<number> {
    const { type } = job.data;

    if (type === 'check') {
      return this.checkAndQueueReminders();
    } else if (type === 'send') {
      await this.sendReminder(job.data.appointmentId!, job.data.hoursBeforeType!);
      return 1;
    }

    return 0;
  }

  private async checkAndQueueReminders(): Promise<number> {
    const now = new Date();
    let queuedCount = 0;

    for (const hoursBefore of SCHEDULING_CONSTANTS.REMINDER_HOURS_BEFORE) {
      const targetTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min before
      const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000); // 30 min after

      const appointments = await this.prisma.appointment.findMany({
        where: {
          status: AppointmentStatus.CONFIRMED,
          slot: {
            startsAt: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
        },
        include: {
          slot: true,
          doctor: { include: { user: { select: { fullName: true, email: true } } } },
          patient: { include: { user: { select: { fullName: true, email: true } } } },
        },
      });

      for (const appointment of appointments) {
        // TODO: Verificar se lembrete já foi enviado (usar tabela de notificações)

        this.logger.log(
          `Would send ${hoursBefore}h reminder for appointment ${appointment.id}`,
        );

        // TODO: Enviar notificação (email, push, SMS)
        // await this.notificationService.sendAppointmentReminder(appointment, hoursBefore);

        queuedCount++;
      }
    }

    return queuedCount;
  }

  private async sendReminder(
    appointmentId: string,
    hoursBefore: number,
  ): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: true,
        doctor: { include: { user: { select: { fullName: true, email: true } } } },
        patient: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });

    if (!appointment || appointment.status !== AppointmentStatus.CONFIRMED) {
      return;
    }

    this.logger.log(
      `Sending ${hoursBefore}h reminder for appointment ${appointmentId} to ${appointment.patient.user.email}`,
    );

    // TODO: Implementar envio real de notificação
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ReminderJobData>, result: number) {
    if (job.data.type === 'check' && result > 0) {
      this.logger.log(
        `Reminder check job ${job.id} completed. Processed ${result} reminders.`,
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ReminderJobData>, error: Error) {
    this.logger.error(
      `Appointment reminder job ${job.id} failed: ${error.message}`,
    );
  }
}
