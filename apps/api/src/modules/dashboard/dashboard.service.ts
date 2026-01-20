import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Estatisticas do dashboard do medico
   */
  async getDoctorDashboard(doctorId: string, organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalPatients,
      consultationsToday,
      consultationsThisMonth,
      completedConsultationsThisMonth,
      totalReports,
      pendingReports,
      totalPrescriptions,
      activePrescriptions,
      upcomingConsultations,
      recentPatients,
      consultationsByStatus,
    ] = await Promise.all([
      // Total de pacientes do medico
      this.prisma.patient.count({
        where: {
          organizationId,
          consultations: {
            some: { doctorId },
          },
        },
      }),

      // Consultas hoje
      this.prisma.consultation.count({
        where: {
          doctorId,
          scheduledAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Consultas este mes
      this.prisma.consultation.count({
        where: {
          doctorId,
          scheduledAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Consultas completadas este mes
      this.prisma.consultation.count({
        where: {
          doctorId,
          status: 'COMPLETED',
          scheduledAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Total de laudos ANVISA
      this.prisma.anvisaReport.count({
        where: { doctorId },
      }),

      // Laudos pendentes
      this.prisma.anvisaReport.count({
        where: {
          doctorId,
          status: { in: ['DRAFT', 'PENDING_SIGNATURE'] },
        },
      }),

      // Total de prescricoes
      this.prisma.prescription.count({
        where: { doctorId },
      }),

      // Prescricoes ativas (nao vencidas)
      this.prisma.prescription.count({
        where: {
          doctorId,
          status: 'SIGNED',
          validUntil: { gte: today },
        },
      }),

      // Proximas consultas (limite 5)
      this.prisma.consultation.findMany({
        where: {
          doctorId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: today },
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      // Pacientes recentes (ultimos 5)
      this.prisma.patient.findMany({
        where: {
          organizationId,
          consultations: {
            some: { doctorId },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          pipelineStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Consultas por status (para grafico)
      this.prisma.consultation.groupBy({
        by: ['status'],
        where: {
          doctorId,
          scheduledAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _count: { id: true },
      }),
    ]);

    return {
      stats: {
        totalPatients,
        consultationsToday,
        consultationsThisMonth,
        completedConsultationsThisMonth,
        totalReports,
        pendingReports,
        totalPrescriptions,
        activePrescriptions,
      },
      upcomingConsultations,
      recentPatients,
      consultationsByStatus: consultationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Resumo semanal para o medico
   */
  async getWeeklySummary(doctorId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const consultations = await this.prisma.consultation.findMany({
      where: {
        doctorId,
        createdAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    // Agrupar por dia
    const byDay: Record<string, { total: number; completed: number }> = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      byDay[key] = { total: 0, completed: 0 };
    }

    consultations.forEach(c => {
      const key = new Date(c.createdAt).toISOString().split('T')[0];
      if (byDay[key]) {
        byDay[key].total++;
        if (c.status === 'COMPLETED') {
          byDay[key].completed++;
        }
      }
    });

    return Object.entries(byDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
