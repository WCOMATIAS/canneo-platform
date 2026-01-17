import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}
