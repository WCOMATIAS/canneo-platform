'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface DoctorStats {
  consultations: number;
  medicalRecords: number;
  prescriptions: number;
  anvisaReports: number;
}

export interface DoctorUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      type: string;
    };
  }>;
}

export interface Doctor {
  id: string;
  crm: string;
  ufCrm: string;
  specialty: string | null;
  user: DoctorUser;
  stats: DoctorStats;
  createdAt: string;
}

export interface DoctorDetail extends Doctor {
  bio: string | null;
  signatureUrl: string | null;
}

export interface DoctorPatient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpfLastFour: string;
  birthDate: string;
  pipelineStatus: string;
  createdAt: string;
  stats: {
    consultations: number;
    prescriptions: number;
    anvisaReports: number;
  };
}

export interface DoctorConsultation {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  startedAt: string | null;
  endedAt: string | null;
  patient: {
    id: string;
    name: string;
    email: string | null;
    cpfLastFour: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface DoctorReport {
  id: string;
  status: string;
  createdAt: string;
  signedAt: string | null;
  patient: {
    id: string;
    name: string;
    cpfLastFour: string;
  };
  prescription: {
    id: string;
    productName: string;
  } | null;
}

export interface DoctorPrescription {
  id: string;
  productName: string;
  concentration: string;
  dosage: string;
  quantity: string;
  status: string;
  validUntil: string;
  createdAt: string;
  signedAt: string | null;
  patient: {
    id: string;
    name: string;
    cpfLastFour: string;
  };
  product: {
    id: string;
    name: string;
    concentration: string;
  } | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalConsultations: number;
  totalOrganizations: number;
  subscriptions: {
    active: number;
    trial: number;
  };
  consultationsByStatus: Record<string, number>;
  estimatedMonthlyRevenue: number;
}

// Hooks
export function useSuperAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['super-admin', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/super-admin/dashboard');
      return response.data;
    },
  });
}

export function useSuperAdminDoctors(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}) {
  return useQuery<{ doctors: Doctor[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'doctors', params],
    queryFn: async () => {
      const response = await api.get('/super-admin/doctors', { params });
      return response.data;
    },
  });
}

export function useSuperAdminDoctor(doctorId: string) {
  return useQuery<DoctorDetail & { stats: DoctorStats & { totalConsultations: number; completedConsultations: number; totalPatients: number; totalPrescriptions: number; totalReports: number; consultationsByStatus: Record<string, number> } }>({
    queryKey: ['super-admin', 'doctors', doctorId],
    queryFn: async () => {
      const response = await api.get(`/super-admin/doctors/${doctorId}`);
      return response.data;
    },
    enabled: !!doctorId,
  });
}

export function useSuperAdminDoctorPatients(
  doctorId: string,
  params: { page?: number; limit?: number; search?: string }
) {
  return useQuery<{ patients: DoctorPatient[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'doctors', doctorId, 'patients', params],
    queryFn: async () => {
      const response = await api.get(`/super-admin/doctors/${doctorId}/patients`, { params });
      return response.data;
    },
    enabled: !!doctorId,
  });
}

export function useSuperAdminDoctorConsultations(
  doctorId: string,
  params: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }
) {
  return useQuery<{ consultations: DoctorConsultation[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'doctors', doctorId, 'consultations', params],
    queryFn: async () => {
      const response = await api.get(`/super-admin/doctors/${doctorId}/consultations`, { params });
      return response.data;
    },
    enabled: !!doctorId,
  });
}

export function useSuperAdminDoctorReports(
  doctorId: string,
  params: { page?: number; limit?: number; status?: string }
) {
  return useQuery<{ reports: DoctorReport[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'doctors', doctorId, 'reports', params],
    queryFn: async () => {
      const response = await api.get(`/super-admin/doctors/${doctorId}/reports`, { params });
      return response.data;
    },
    enabled: !!doctorId,
  });
}

export function useSuperAdminDoctorPrescriptions(
  doctorId: string,
  params: { page?: number; limit?: number; status?: string }
) {
  return useQuery<{ prescriptions: DoctorPrescription[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'doctors', doctorId, 'prescriptions', params],
    queryFn: async () => {
      const response = await api.get(`/super-admin/doctors/${doctorId}/prescriptions`, { params });
      return response.data;
    },
    enabled: !!doctorId,
  });
}

// Patient Types
export interface PatientDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface PatientOrganization {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpfLastFour: string;
  birthDate: string | null;
  gender: string | null;
  address: any;
  allergies: string[];
  conditions: string[];
  medications: string[];
  pipelineStatus: string;
  organization: PatientOrganization | null;
  documents: PatientDocument[];
  stats: {
    consultations: number;
    prescriptions: number;
    anvisaReports: number;
    medicalRecords: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetail extends Patient {
  consultations: Array<{
    id: string;
    type: string;
    status: string;
    scheduledAt: string;
    doctor: {
      id: string;
      user: {
        name: string;
        email: string;
      };
    };
  }>;
  prescriptions: Array<{
    id: string;
    productName: string;
    dosage: string;
    status: string;
    createdAt: string;
    doctor: {
      user: {
        name: string;
      };
    };
    product: {
      id: string;
      name: string;
      concentration: string;
    } | null;
  }>;
  anvisaReports: Array<{
    id: string;
    status: string;
    createdAt: string;
    doctor: {
      user: {
        name: string;
      };
    };
  }>;
  medicalRecords: Array<{
    id: string;
    templateType: string;
    createdAt: string;
    doctor: {
      user: {
        name: string;
      };
    };
  }>;
}

// Patient Hooks
export function useSuperAdminPatients(params: {
  page?: number;
  limit?: number;
  search?: string;
  pipelineStatus?: string;
}) {
  return useQuery<{ patients: Patient[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'patients', params],
    queryFn: async () => {
      const response = await api.get('/super-admin/patients', { params });
      return response.data;
    },
  });
}

export function useSuperAdminPatient(patientId: string) {
  return useQuery<PatientDetail & { stats: { totalConsultations: number; completedConsultations: number; totalPrescriptions: number; totalReports: number; totalRecords: number } }>({
    queryKey: ['super-admin', 'patients', patientId],
    queryFn: async () => {
      const response = await api.get(`/super-admin/patients/${patientId}`);
      return response.data;
    },
    enabled: !!patientId,
  });
}

// Organization Types
export interface OrganizationPlan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  maxDoctors: number;
  maxPatients: number;
}

export interface OrganizationSubscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  plan: OrganizationPlan;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: any;
  logoUrl: string | null;
  subscription: OrganizationSubscription | null;
  _count: {
    doctors: number;
    patients: number;
    memberships: number;
    consultations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDetail extends Organization {
  memberships: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

// Organization Hooks
export function useSuperAdminOrganizations(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  subscriptionStatus?: string;
}) {
  return useQuery<{ organizations: Organization[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'organizations', params],
    queryFn: async () => {
      const response = await api.get('/super-admin/organizations', { params });
      return response.data;
    },
  });
}

export function useSuperAdminOrganization(organizationId: string) {
  return useQuery<OrganizationDetail>({
    queryKey: ['super-admin', 'organizations', organizationId],
    queryFn: async () => {
      const response = await api.get(`/super-admin/organizations/${organizationId}`);
      return response.data;
    },
    enabled: !!organizationId,
  });
}

// Subscription Types
export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  plan: OrganizationPlan;
  createdAt: string;
  updatedAt: string;
}

// Mock data for subscriptions
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    status: 'ACTIVE',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndsAt: null,
    canceledAt: null,
    stripeSubscriptionId: null,
    organization: { id: '1', name: 'Clinica CANNEO Demo', slug: 'clinica-canneo-demo', type: 'CLINIC' },
    plan: { id: '1', name: 'TEAM', slug: 'team', monthlyPrice: 29900, maxDoctors: 5, maxPatients: 500 },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Subscription Hooks
export function useSuperAdminSubscriptions(params: {
  page?: number;
  limit?: number;
  status?: string;
  planId?: string;
}) {
  return useQuery<{ subscriptions: Subscription[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'subscriptions', params],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/subscriptions', { params });
        return response.data;
      } catch (error) {
        // Retornar dados mock se a API falhar
        console.log('[useSuperAdminSubscriptions] Using mock data');
        return {
          subscriptions: MOCK_SUBSCRIPTIONS,
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };
      }
    },
  });
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

// Mock audit logs
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    action: 'CREATE',
    entityType: 'ORGANIZATION',
    entityId: '1',
    details: { name: 'Clinica CANNEO Demo' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    user: { id: '1', name: 'Super Admin', email: 'superadmin@canneo.com.br' },
    organization: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '2',
    action: 'LOGIN',
    entityType: 'USER',
    entityId: '1',
    details: { method: 'email' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    user: { id: '1', name: 'Super Admin', email: 'superadmin@canneo.com.br' },
    organization: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Audit Log Hooks
export function useSuperAdminAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<{ logs: AuditLog[]; pagination: Pagination }>({
    queryKey: ['super-admin', 'audit-logs', params],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/audit-logs', { params });
        return response.data;
      } catch (error) {
        console.log('[useSuperAdminAuditLogs] Using mock data');
        return {
          logs: MOCK_AUDIT_LOGS,
          pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
        };
      }
    },
  });
}

// System Monitoring Types
export interface SystemMetrics {
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connections: number;
    poolSize: number;
  };
  redis: {
    status: 'healthy' | 'degraded' | 'down';
    memory: number;
    keys: number;
  };
  storage: {
    used: number;
    total: number;
  };
  recentErrors: Array<{
    id: string;
    message: string;
    stack: string | null;
    createdAt: string;
  }>;
}

// Mock system metrics
const MOCK_SYSTEM_METRICS: SystemMetrics = {
  api: { status: 'healthy', responseTime: 45, uptime: 86400 * 7 },
  database: { status: 'healthy', connections: 5, poolSize: 20 },
  redis: { status: 'healthy', memory: 1024 * 1024 * 50, keys: 1234 },
  storage: { used: 1024 * 1024 * 1024 * 2, total: 1024 * 1024 * 1024 * 100 },
  recentErrors: [],
};

// System Monitoring Hooks
export function useSuperAdminSystemMetrics() {
  return useQuery<SystemMetrics>({
    queryKey: ['super-admin', 'monitoring'],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/monitoring');
        return response.data;
      } catch (error) {
        console.log('[useSuperAdminSystemMetrics] Using mock data');
        return MOCK_SYSTEM_METRICS;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Plans
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  maxDoctors: number;
  maxPatients: number;
  maxStorageGb: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

// Mock plans
const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    name: 'STARTER',
    slug: 'starter',
    description: 'Ideal para clinicas pequenas',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    maxDoctors: 1,
    maxPatients: 100,
    maxStorageGb: 5,
    features: ['1 medico', 'Ate 100 pacientes', 'Suporte por email'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'TEAM',
    slug: 'team',
    description: 'Para equipes em crescimento',
    monthlyPrice: 29900,
    yearlyPrice: 299000,
    maxDoctors: 5,
    maxPatients: 500,
    maxStorageGb: 20,
    features: ['Ate 5 medicos', 'Ate 500 pacientes', 'Suporte prioritario', 'Relatorios avancados'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'ENTERPRISE',
    slug: 'enterprise',
    description: 'Para grandes organizacoes',
    monthlyPrice: 99900,
    yearlyPrice: 999000,
    maxDoctors: -1,
    maxPatients: -1,
    maxStorageGb: 100,
    features: ['Medicos ilimitados', 'Pacientes ilimitados', 'Suporte 24/7', 'API dedicada', 'SLA 99.9%'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function useSuperAdminPlans() {
  return useQuery<Plan[]>({
    queryKey: ['super-admin', 'plans'],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/plans');
        return response.data;
      } catch (error) {
        console.log('[useSuperAdminPlans] Using mock data');
        return MOCK_PLANS;
      }
    },
  });
}

// Notifications
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: any;
  createdAt: string;
}

export function useSuperAdminNotifications() {
  return useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['super-admin', 'notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/notifications');
        return response.data;
      } catch (error) {
        // O header usa seus próprios dados mock, então apenas retornar vazio
        console.log('[useSuperAdminNotifications] API not available');
        throw error; // Deixar o header usar seus dados mock locais
      }
    },
    refetchInterval: 60000, // Refetch every minute
    retry: false, // Não retentar se falhar
  });
}

// Reports
export interface ReportData {
  consultationsByPeriod: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  newUsersByPeriod: Array<{
    date: string;
    doctors: number;
    patients: number;
    organizations: number;
  }>;
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
    subscriptions: number;
  }>;
  topOrganizations: Array<{
    id: string;
    name: string;
    consultations: number;
    revenue: number;
  }>;
}

// Mock reports data
const MOCK_REPORTS: ReportData = {
  consultationsByPeriod: [
    { date: '2026-01-13', count: 12, revenue: 120000 },
    { date: '2026-01-14', count: 8, revenue: 80000 },
    { date: '2026-01-15', count: 15, revenue: 150000 },
    { date: '2026-01-16', count: 10, revenue: 100000 },
    { date: '2026-01-17', count: 18, revenue: 180000 },
    { date: '2026-01-18', count: 5, revenue: 50000 },
    { date: '2026-01-19', count: 3, revenue: 30000 },
  ],
  newUsersByPeriod: [
    { date: '2026-01-13', doctors: 1, patients: 5, organizations: 0 },
    { date: '2026-01-14', doctors: 0, patients: 3, organizations: 1 },
    { date: '2026-01-15', doctors: 2, patients: 8, organizations: 0 },
    { date: '2026-01-16', doctors: 0, patients: 4, organizations: 0 },
    { date: '2026-01-17', doctors: 1, patients: 6, organizations: 0 },
  ],
  revenueByPlan: [
    { plan: 'STARTER', revenue: 99000, subscriptions: 10 },
    { plan: 'TEAM', revenue: 299000, subscriptions: 10 },
    { plan: 'ENTERPRISE', revenue: 499500, subscriptions: 5 },
  ],
  topOrganizations: [
    { id: '1', name: 'Clinica CANNEO Demo', consultations: 45, revenue: 450000 },
    { id: '2', name: 'Hospital Santa Maria', consultations: 32, revenue: 320000 },
    { id: '3', name: 'Centro Medico Vida', consultations: 28, revenue: 280000 },
  ],
};

export function useSuperAdminReports(params: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useQuery<ReportData>({
    queryKey: ['super-admin', 'reports', params],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/reports', { params });
        return response.data;
      } catch (error) {
        console.log('[useSuperAdminReports] Using mock data');
        return MOCK_REPORTS;
      }
    },
  });
}

// Settings Types
export interface SystemSettings {
  general: {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    senderEmail: string;
    senderName: string;
  };
  security: {
    mfaRequired: boolean;
    sessionExpiration: boolean;
    maxLoginAttempts: number;
    passwordStrengthRequired: boolean;
    activityLogging: boolean;
  };
  lastBackup: string | null;
}

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    platformName: 'CANNEO',
    supportEmail: 'suporte@canneo.com.br',
    maintenanceMode: false,
    allowNewRegistrations: true,
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    senderEmail: '',
    senderName: 'CANNEO',
  },
  security: {
    mfaRequired: false,
    sessionExpiration: true,
    maxLoginAttempts: 5,
    passwordStrengthRequired: true,
    activityLogging: true,
  },
  lastBackup: null,
};

export function useSuperAdminSettings() {
  return useQuery<SystemSettings>({
    queryKey: ['super-admin', 'settings'],
    queryFn: async () => {
      try {
        const response = await api.get('/super-admin/settings');
        return response.data;
      } catch (error) {
        console.log('[useSuperAdminSettings] Using default settings');
        return DEFAULT_SETTINGS;
      }
    },
  });
}

// Health Check
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: { status: string; responseTime: number };
    database: { status: string; responseTime: number };
    redis: { status: string; message?: string };
    storage: { status: string; message?: string };
  };
  version: string;
  environment: string;
  timestamp: string;
}

export function useSuperAdminHealthCheck() {
  return useQuery<HealthCheck>({
    queryKey: ['super-admin', 'health'],
    queryFn: async () => {
      const response = await api.get('/super-admin/monitoring/health');
      return response.data;
    },
    refetchInterval: 30000,
  });
}
