import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  mfaEnabled: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'CLINICA' | 'ASSOCIACAO';
}

export interface Membership {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'DOCTOR' | 'SECRETARY' | 'VIEWER';
  organization: Organization;
}

export interface DoctorProfile {
  id: string;
  name: string;
  crm: string;
  ufCrm: string;
  specialty?: string;
}

interface AuthState {
  user: User | null;
  membership: Membership | null;
  doctorProfile: DoctorProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (data: {
    user: User;
    membership: Membership;
    doctorProfile?: DoctorProfile;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setMembership: (membership: Membership) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      membership: null,
      doctorProfile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (data) => {
        // Salvar tokens no localStorage para o interceptor do axios
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('organizationId', data.membership.organization.id);

        set({
          user: data.user,
          membership: data.membership,
          doctorProfile: data.doctorProfile || null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setMembership: (membership) => {
        localStorage.setItem('organizationId', membership.organization.id);
        set({ membership });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('organizationId');

        set({
          user: null,
          membership: null,
          doctorProfile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'canneo-auth',
      partialize: (state) => ({
        user: state.user,
        membership: state.membership,
        doctorProfile: state.doctorProfile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
