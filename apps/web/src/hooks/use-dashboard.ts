'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface DashboardStats {
  totalPatients: number;
  consultationsToday: number;
  consultationsThisMonth: number;
  completedConsultationsThisMonth: number;
  totalReports: number;
  pendingReports: number;
  totalPrescriptions: number;
  activePrescriptions: number;
}

export interface UpcomingConsultation {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  dailyRoomName: string | null;
  dailyRoomUrl: string | null;
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export interface RecentPatient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pipelineStatus: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingConsultations: UpcomingConsultation[];
  recentPatients: RecentPatient[];
  consultationsByStatus: Record<string, number>;
}

export interface WeeklySummary {
  date: string;
  total: number;
  completed: number;
}

// Mock data for when API is not available
const MOCK_DASHBOARD: DashboardData = {
  stats: {
    totalPatients: 0,
    consultationsToday: 0,
    consultationsThisMonth: 0,
    completedConsultationsThisMonth: 0,
    totalReports: 0,
    pendingReports: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
  },
  upcomingConsultations: [],
  recentPatients: [],
  consultationsByStatus: {},
};

/**
 * Hook para buscar dados do dashboard do medico
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard');
        return response.data;
      } catch (error) {
        console.log('[useDashboard] Using mock data');
        return MOCK_DASHBOARD;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook para buscar resumo semanal
 */
export function useWeeklySummary() {
  return useQuery<WeeklySummary[]>({
    queryKey: ['dashboard', 'weekly-summary'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/weekly-summary');
        return response.data;
      } catch (error) {
        console.log('[useWeeklySummary] Using empty data');
        return [];
      }
    },
  });
}
