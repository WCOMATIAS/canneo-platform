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
