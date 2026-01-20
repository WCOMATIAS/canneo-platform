import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';
import * as os from 'os';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Estatisticas gerais da plataforma
   */
  async getDashboardStats() {
    const [
      totalDoctors,
      totalPatients,
      totalConsultations,
      totalOrganizations,
      activeSubscriptions,
      trialSubscriptions,
    ] = await Promise.all([
      this.prisma.doctorProfile.count(),
      this.prisma.patient.count(),
      this.prisma.consultation.count(),
      this.prisma.organization.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
    ]);

    // Consultas por status
    const consultationsByStatus = await this.prisma.consultation.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Receita estimada (subscriptions ativas)
    const subscriptionsWithPlans = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    const monthlyRevenue = subscriptionsWithPlans.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + Number(sub.plan.priceMonthly);
      }
      return total + Number(sub.plan.priceYearly) / 12;
    }, 0);

    return {
      totalDoctors,
      totalPatients,
      totalConsultations,
      totalOrganizations,
      subscriptions: {
        active: activeSubscriptions,
        trial: trialSubscriptions,
      },
      consultationsByStatus: consultationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      estimatedMonthlyRevenue: monthlyRevenue,
    };
  }

  /**
   * Lista todos os medicos da plataforma
   */
  async listDoctors(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  }) {
    const { page = 1, limit = 10, search, status = 'all' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { crm: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.user = { ...where.user, memberships: { some: { isActive: true } } };
    } else if (status === 'inactive') {
      where.user = { ...where.user, memberships: { every: { isActive: false } } };
    }

    const [doctors, total] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              avatarUrl: true,
              emailVerified: true,
              mfaEnabled: true,
              lastLoginAt: true,
              createdAt: true,
              memberships: {
                include: {
                  organization: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              consultations: true,
              medicalRecords: true,
              prescriptions: true,
              anvisaReports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.doctorProfile.count({ where }),
    ]);

    return {
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        crm: doctor.crm,
        ufCrm: doctor.ufCrm,
        specialty: doctor.specialty,
        user: doctor.user,
        stats: {
          consultations: doctor._count.consultations,
          medicalRecords: doctor._count.medicalRecords,
          prescriptions: doctor._count.prescriptions,
          anvisaReports: doctor._count.anvisaReports,
        },
        createdAt: doctor.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Detalhes completos de um medico
   */
  async getDoctorById(doctorId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatarUrl: true,
            emailVerified: true,
            mfaEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            memberships: {
              include: {
                organization: {
                  include: {
                    subscriptions: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                      include: { plan: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Medico nao encontrado');
    }

    // Estatisticas do medico
    const [
      totalConsultations,
      completedConsultations,
      totalPatients,
      totalPrescriptions,
      totalReports,
      consultationsByMonth,
    ] = await Promise.all([
      this.prisma.consultation.count({ where: { doctorId } }),
      this.prisma.consultation.count({ where: { doctorId, status: 'COMPLETED' } }),
      this.prisma.patient.count({
        where: {
          consultations: { some: { doctorId } },
        },
      }),
      this.prisma.prescription.count({ where: { doctorId } }),
      this.prisma.anvisaReport.count({ where: { doctorId } }),
      this.prisma.consultation.groupBy({
        by: ['status'],
        where: {
          doctorId,
          scheduledAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        _count: { id: true },
      }),
    ]);

    return {
      ...doctor,
      stats: {
        totalConsultations,
        completedConsultations,
        totalPatients,
        totalPrescriptions,
        totalReports,
        consultationsByStatus: consultationsByMonth.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  /**
   * Lista pacientes de um medico
   */
  async getDoctorPatients(
    doctorId: string,
    params: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      consultations: { some: { doctorId } },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfLastFour: true,
          birthDate: true,
          pipelineStatus: true,
          createdAt: true,
          _count: {
            select: {
              consultations: { where: { doctorId } },
              prescriptions: { where: { doctorId } },
              anvisaReports: { where: { doctorId } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      patients: patients.map((p) => ({
        ...p,
        stats: {
          consultations: p._count.consultations,
          prescriptions: p._count.prescriptions,
          anvisaReports: p._count.anvisaReports,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista consultas de um medico
   */
  async getDoctorConsultations(
    doctorId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { page = 1, limit = 10, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = { doctorId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledAt.lte = new Date(endDate);
      }
    }

    const [consultations, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              cpfLastFour: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      consultations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista laudos ANVISA de um medico
   */
  async getDoctorReports(
    doctorId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ) {
    const { page = 1, limit = 10, status } = params;
    const skip = (page - 1) * limit;

    const where: any = { doctorId };

    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.anvisaReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpfLastFour: true,
            },
          },
          prescription: {
            select: {
              id: true,
              productName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.anvisaReport.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista prescricoes de um medico
   */
  async getDoctorPrescriptions(
    doctorId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ) {
    const { page = 1, limit = 10, status } = params;
    const skip = (page - 1) * limit;

    const where: any = { doctorId };

    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpfLastFour: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              concentration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      prescriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista todas as organizacoes
   */
  async listOrganizations(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, search, type } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { plan: true },
          },
          _count: {
            select: {
              memberships: true,
              patients: true,
              consultations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      organizations: organizations.map((org) => ({
        ...org,
        currentSubscription: org.subscriptions[0] || null,
        stats: {
          members: org._count.memberships,
          patients: org._count.patients,
          consultations: org._count.consultations,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista todos os pacientes da plataforma
   */
  async listAllPatients(params: {
    page?: number;
    limit?: number;
    search?: string;
    pipelineStatus?: string;
  }) {
    const { page = 1, limit = 10, search, pipelineStatus } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpfLastFour: { contains: search } },
      ];
    }

    if (pipelineStatus) {
      where.pipelineStatus = pipelineStatus;
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              consultations: true,
              prescriptions: true,
              anvisaReports: true,
              medicalRecords: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        cpfLastFour: p.cpfLastFour,
        birthDate: p.birthDate,
        gender: p.gender,
        address: p.address,
        allergies: p.allergies,
        conditions: p.conditions,
        medications: p.medications,
        pipelineStatus: p.pipelineStatus,
        organization: p.organization,
        documents: p.documents,
        stats: {
          consultations: p._count.consultations,
          prescriptions: p._count.prescriptions,
          anvisaReports: p._count.anvisaReports,
          medicalRecords: p._count.medicalRecords,
        },
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Detalhes completos de um paciente
   */
  async getPatientById(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        consultations: {
          take: 10,
          orderBy: { scheduledAt: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        prescriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        anvisaReports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        medicalRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    // Estatisticas do paciente
    const [
      totalConsultations,
      completedConsultations,
      totalPrescriptions,
      totalReports,
      totalRecords,
    ] = await Promise.all([
      this.prisma.consultation.count({ where: { patientId } }),
      this.prisma.consultation.count({ where: { patientId, status: 'COMPLETED' } }),
      this.prisma.prescription.count({ where: { patientId } }),
      this.prisma.anvisaReport.count({ where: { patientId } }),
      this.prisma.medicalRecord.count({ where: { patientId } }),
    ]);

    return {
      ...patient,
      stats: {
        totalConsultations,
        completedConsultations,
        totalPrescriptions,
        totalReports,
        totalRecords,
      },
    };
  }

  /**
   * Lista audit logs
   */
  async listAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 50, action, entity, userId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }
    if (entity) {
      where.entity = entity;
    }
    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * Lista todas as assinaturas
   */
  async listSubscriptions(params: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
  }) {
    const { page = 1, limit = 10, status, planId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (planId) {
      where.planId = planId;
    }

    const [subscriptions, total, stats] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
      this.getSubscriptionStats(),
    ]);

    return {
      subscriptions,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getSubscriptionStats() {
    const [active, trial, pastDue, canceled] = await Promise.all([
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
      this.prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELED' } }),
    ]);

    // Calcular receita mensal
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    const monthlyRevenue = activeSubscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + Number(sub.plan.priceMonthly);
      }
      return total + Number(sub.plan.priceYearly) / 12;
    }, 0);

    return {
      active,
      trial,
      pastDue,
      canceled,
      total: active + trial + pastDue + canceled,
      monthlyRevenue,
    };
  }

  /**
   * Detalhes de uma assinatura
   */
  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            memberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                patients: true,
                consultations: true,
              },
            },
          },
        },
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura nao encontrada');
    }

    return subscription;
  }

  /**
   * Atualiza status de uma assinatura
   */
  async updateSubscriptionStatus(id: string, status: string, reason?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura nao encontrada');
    }

    const updateData: any = { status };

    if (status === 'CANCELED') {
      updateData.canceledAt = new Date();
      updateData.cancelReason = reason;
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
        plan: true,
      },
    });
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Lista notificacoes (Super Admin ve todas)
   */
  async listNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const { page = 1, limit = 20, unreadOnly = false } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: null, // Notificacoes globais (Super Admin)
    };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, read: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marca notificacao como lida
   */
  async markNotificationAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificacao nao encontrada');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marca todas as notificacoes como lidas
   */
  async markAllNotificationsAsRead() {
    await this.prisma.notification.updateMany({
      where: {
        userId: null,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Cria uma notificacao
   */
  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId?: string;
    organizationId?: string;
    data?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        userId: data.userId,
        organizationId: data.organizationId,
        data: data.data,
      },
    });
  }

  /**
   * Deleta uma notificacao
   */
  async deleteNotification(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificacao nao encontrada');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  /**
   * Metricas do sistema
   */
  async getSystemMetrics() {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalOrganizations,
      totalConsultations,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.doctorProfile.count(),
      this.prisma.patient.count(),
      this.prisma.organization.count(),
      this.prisma.consultation.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    // Metricas de sistema
    const systemInfo = {
      platform: os.platform(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
    };

    return {
      database: {
        users: totalUsers,
        doctors: totalDoctors,
        patients: totalPatients,
        organizations: totalOrganizations,
        consultations: totalConsultations,
        activeSubscriptions,
      },
      system: systemInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check detalhado
   */
  async getHealthCheck() {
    const checks = {
      api: { status: 'healthy', responseTime: 0 },
      database: { status: 'unknown', responseTime: 0 },
      redis: { status: 'unknown', message: 'Not configured' },
      storage: { status: 'unknown', message: 'Not configured' },
    };

    // Check database
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
      };
    }

    // API info
    checks.api = {
      status: 'healthy',
      responseTime: Date.now() - dbStart,
    };

    const overallStatus =
      checks.database.status === 'healthy' && checks.api.status === 'healthy'
        ? 'healthy'
        : 'degraded';

    return {
      status: overallStatus,
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Erros recentes (via audit logs de erros)
   */
  async getRecentErrors(limit: number = 20) {
    // Buscar logs recentes que podem indicar erros
    const recentLogs = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { action: 'DELETE' },
          { entity: 'ERROR' },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      errors: recentLogs,
      total: recentLogs.length,
    };
  }

  // ============================================================================
  // REPORTS / ANALYTICS
  // ============================================================================

  /**
   * Relatorios analiticos
   */
  async getReports(params: {
    startDate?: string;
    endDate?: string;
    groupBy: 'daily' | 'weekly' | 'monthly';
  }) {
    const { startDate, endDate, groupBy } = params;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    } else {
      // Default: ultimos 30 dias
      dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const [
      consultations,
      newPatients,
      newDoctors,
      newOrganizations,
      subscriptionsData,
    ] = await Promise.all([
      this.prisma.consultation.findMany({
        where: { createdAt: dateFilter },
        select: { id: true, status: true, createdAt: true },
      }),
      this.prisma.patient.count({ where: { createdAt: dateFilter } }),
      this.prisma.doctorProfile.count({ where: { createdAt: dateFilter } }),
      this.prisma.organization.count({ where: { createdAt: dateFilter } }),
      this.prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
    ]);

    // Agrupar consultas por periodo
    const consultationsByPeriod = this.groupByPeriod(consultations, groupBy);

    // Calcular receita mensal estimada
    const monthlyRevenue = subscriptionsData.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + Number(sub.plan.priceMonthly);
      }
      return total + Number(sub.plan.priceYearly) / 12;
    }, 0);

    return {
      summary: {
        totalConsultations: consultations.length,
        completedConsultations: consultations.filter(c => c.status === 'COMPLETED').length,
        newPatients,
        newDoctors,
        newOrganizations,
        monthlyRevenue,
      },
      consultationsByPeriod,
      period: {
        start: dateFilter.gte,
        end: dateFilter.lte || new Date(),
        groupBy,
      },
    };
  }

  private groupByPeriod(items: any[], groupBy: string) {
    const groups: Record<string, number> = {};

    items.forEach(item => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (groupBy) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const week = Math.ceil(date.getDate() / 7);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Receita por plano
   */
  async getRevenueByPlan() {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    return plans.map(plan => {
      const monthlyFromMonthly = plan.subscriptions
        .filter(s => s.billingCycle === 'monthly')
        .length * Number(plan.priceMonthly);

      const monthlyFromYearly = plan.subscriptions
        .filter(s => s.billingCycle === 'yearly')
        .length * (Number(plan.priceYearly) / 12);

      return {
        planId: plan.id,
        planName: plan.displayName,
        subscriptionCount: plan.subscriptions.length,
        monthlyRevenue: monthlyFromMonthly + monthlyFromYearly,
        yearlyProjected: (monthlyFromMonthly + monthlyFromYearly) * 12,
      };
    });
  }

  /**
   * Top organizacoes
   */
  async getTopOrganizations(limit: number = 10) {
    const organizations = await this.prisma.organization.findMany({
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
        _count: {
          select: {
            patients: true,
            consultations: true,
            memberships: true,
          },
        },
      },
      orderBy: {
        consultations: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      plan: org.subscriptions[0]?.plan?.displayName || 'Sem plano',
      stats: {
        patients: org._count.patients,
        consultations: org._count.consultations,
        members: org._count.memberships,
      },
      monthlyRevenue: org.subscriptions[0]
        ? org.subscriptions[0].billingCycle === 'monthly'
          ? Number(org.subscriptions[0].plan.priceMonthly)
          : Number(org.subscriptions[0].plan.priceYearly) / 12
        : 0,
    }));
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  /**
   * Busca todas as configuracoes
   */
  async getSettings() {
    const settings = await this.prisma.systemSettings.findMany();

    // Transformar em objeto
    const settingsObject: Record<string, any> = {};
    settings.forEach(s => {
      settingsObject[s.key] = s.value;
    });

    // Retornar com defaults
    return {
      general: {
        platformName: settingsObject['general.platformName'] || 'CANNEO',
        supportEmail: settingsObject['general.supportEmail'] || 'suporte@canneo.com.br',
        maintenanceMode: settingsObject['general.maintenanceMode'] || false,
        allowNewRegistrations: settingsObject['general.allowNewRegistrations'] || true,
      },
      email: {
        smtpHost: settingsObject['email.smtpHost'] || '',
        smtpPort: settingsObject['email.smtpPort'] || 587,
        smtpUser: settingsObject['email.smtpUser'] || '',
        senderEmail: settingsObject['email.senderEmail'] || '',
        senderName: settingsObject['email.senderName'] || 'CANNEO',
      },
      security: {
        mfaRequired: settingsObject['security.mfaRequired'] || false,
        sessionExpiration: settingsObject['security.sessionExpiration'] || true,
        maxLoginAttempts: settingsObject['security.maxLoginAttempts'] || 5,
        passwordStrengthRequired: settingsObject['security.passwordStrengthRequired'] || true,
        activityLogging: settingsObject['security.activityLogging'] || true,
      },
      lastBackup: settingsObject['system.lastBackup'] || null,
    };
  }

  /**
   * Atualiza configuracoes
   */
  async updateSettings(data: Record<string, any>, userId?: string) {
    const updates: Promise<any>[] = [];

    // Flatten and save each setting
    const flattenSettings = (obj: any, prefix = ''): Record<string, any> => {
      const result: Record<string, any> = {};
      for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(result, flattenSettings(obj[key], newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
      return result;
    };

    const flatSettings = flattenSettings(data);

    for (const [key, value] of Object.entries(flatSettings)) {
      updates.push(
        this.prisma.systemSettings.upsert({
          where: { key },
          create: {
            key,
            value: value as any,
            updatedBy: userId,
          },
          update: {
            value: value as any,
            updatedBy: userId,
          },
        }),
      );
    }

    await Promise.all(updates);
    return this.getSettings();
  }

  /**
   * Lista todos os planos
   */
  async listPlans() {
    return this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  /**
   * Cria novo plano
   */
  async createPlan(data: {
    name: string;
    displayName: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    maxDoctors: number;
    maxPatients: number;
    maxConsultations: number;
    features?: any;
  }) {
    // Verificar se ja existe plano com mesmo nome
    const existing = await this.prisma.plan.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Plano com este nome ja existe');
    }

    return this.prisma.plan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        maxDoctors: data.maxDoctors,
        maxPatients: data.maxPatients,
        maxConsultations: data.maxConsultations,
        features: data.features || [],
      },
    });
  }

  /**
   * Atualiza plano
   */
  async updatePlan(id: string, data: Partial<{
    displayName: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    maxDoctors: number;
    maxPatients: number;
    maxConsultations: number;
    features: any;
    isActive: boolean;
  }>) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta plano (soft delete)
   */
  async deletePlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });

    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    if (plan._count.subscriptions > 0) {
      throw new BadRequestException('Nao e possivel deletar plano com assinaturas ativas');
    }

    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // CRUD DOCTORS
  // ============================================================================

  /**
   * Cria novo medico
   */
  async createDoctor(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    crm: string;
    ufCrm: string;
    specialty?: string;
    organizationId: string;
    role?: string;
  }) {
    // Verificar se email ja existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email ja cadastrado');
    }

    // Verificar se CRM ja existe
    const existingCrm = await this.prisma.doctorProfile.findUnique({
      where: {
        crm_ufCrm: {
          crm: data.crm,
          ufCrm: data.ufCrm,
        },
      },
    });

    if (existingCrm) {
      throw new ConflictException('CRM ja cadastrado');
    }

    // Verificar organizacao
    const organization = await this.prisma.organization.findUnique({
      where: { id: data.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organizacao nao encontrada');
    }

    // Hash da senha
    const passwordHash = await bcryptjs.hash(data.password, 10);

    // Criar tudo em transacao
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar usuario
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          phone: data.phone,
        },
      });

      // Criar perfil de medico
      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          crm: data.crm,
          ufCrm: data.ufCrm,
          specialty: data.specialty,
        },
      });

      // Criar membership
      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: data.organizationId,
          role: (data.role as any) || 'DOCTOR',
          joinedAt: new Date(),
        },
      });

      return { user, doctorProfile };
    });

    // Criar notificacao
    await this.createNotification({
      type: 'USER',
      title: 'Novo medico cadastrado',
      message: `${data.name} foi adicionado a plataforma.`,
      data: { userId: result.user.id, doctorId: result.doctorProfile.id },
    });

    return result;
  }

  /**
   * Atualiza medico
   */
  async updateDoctor(id: string, data: Partial<{
    name: string;
    phone: string;
    specialty: string;
    bio: string;
    isActive: boolean;
  }>) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Medico nao encontrado');
    }

    // Atualizar user e doctorProfile
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: doctor.userId },
        data: {
          name: data.name,
          phone: data.phone,
        },
      }),
      this.prisma.doctorProfile.update({
        where: { id },
        data: {
          specialty: data.specialty,
          bio: data.bio,
        },
      }),
    ]);

    // Se mudou isActive, atualizar memberships
    if (data.isActive !== undefined) {
      await this.prisma.membership.updateMany({
        where: { userId: doctor.userId },
        data: { isActive: data.isActive },
      });
    }

    return this.getDoctorById(id);
  }

  /**
   * Atualiza status do medico
   */
  async updateDoctorStatus(id: string, isActive: boolean) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Medico nao encontrado');
    }

    await this.prisma.membership.updateMany({
      where: { userId: doctor.userId },
      data: { isActive },
    });

    return this.getDoctorById(id);
  }

  // ============================================================================
  // CRUD ORGANIZATIONS
  // ============================================================================

  /**
   * Detalhes de uma organizacao
   */
  async getOrganizationById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                lastLoginAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            patients: true,
            consultations: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organizacao nao encontrada');
    }

    return organization;
  }

  /**
   * Cria nova organizacao
   */
  async createOrganization(data: {
    name: string;
    slug: string;
    type?: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    planId: string;
  }) {
    // Verificar se slug ja existe
    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug ja em uso');
    }

    // Verificar se CNPJ ja existe (se fornecido)
    if (data.cnpj) {
      const existingCnpj = await this.prisma.organization.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existingCnpj) {
        throw new ConflictException('CNPJ ja cadastrado');
      }
    }

    // Verificar plano
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    // Criar organizacao com subscription trial
    const organization = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          type: (data.type as any) || 'CLINICA',
          cnpj: data.cnpj,
          email: data.email,
          phone: data.phone,
        },
      });

      // Criar subscription trial
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          planId: data.planId,
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        },
      });

      return org;
    });

    // Criar notificacao
    await this.createNotification({
      type: 'ORGANIZATION',
      title: 'Nova organizacao cadastrada',
      message: `${data.name} foi cadastrada na plataforma.`,
      data: { organizationId: organization.id },
    });

    return this.getOrganizationById(organization.id);
  }

  /**
   * Atualiza organizacao
   */
  async updateOrganization(id: string, data: Partial<{
    name: string;
    logo: string;
    email: string;
    phone: string;
    address: any;
    settings: any;
  }>) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organizacao nao encontrada');
    }

    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta organizacao (cascata de dados)
   */
  async deleteOrganization(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            patients: true,
            consultations: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organizacao nao encontrada');
    }

    // Nao deletar se tiver dados (seguranca)
    if (organization._count.patients > 0 || organization._count.consultations > 0) {
      throw new BadRequestException(
        'Nao e possivel deletar organizacao com pacientes ou consultas. Desative as assinaturas primeiro.',
      );
    }

    await this.prisma.organization.delete({ where: { id } });
    return { success: true };
  }
}
