'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Types
export interface PatientProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string;
  gender: string | null;
  address: any | null;
  allergies: string[];
  conditions: string[];
  medications: string[];
  pipelineStatus: string;
  organization: {
    id: string;
    name: string;
    logo: string | null;
    phone: string | null;
    email: string | null;
  };
}

export interface PatientConsultation {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  startedAt: string | null;
  endedAt: string | null;
  dailyRoomUrl: string | null;
  notes: string | null;
  doctor: {
    id: string;
    name: string;
    avatarUrl: string | null;
    specialty: string | null;
    crm: string;
    ufCrm: string;
  };
}

export interface PatientPrescription {
  id: string;
  productName: string;
  concentration: string;
  dosage: string;
  quantity: string;
  instructions: string | null;
  validUntil: string;
  status: string;
  pdfUrl: string | null;
  signedAt: string | null;
  createdAt: string;
  isActive: boolean;
  isExpired: boolean;
  doctor: {
    id: string;
    name: string;
    crm: string;
    ufCrm: string;
  };
  product: {
    id: string;
    name: string;
    manufacturer: string;
    activeCompound: string;
  } | null;
}

export interface PatientDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface RequiredDocument {
  type: string;
  label: string;
  required: boolean;
  uploaded: boolean;
  documents: PatientDocument[];
}

export interface PatientAnvisaReport {
  id: string;
  status: string;
  pdfUrl: string | null;
  packageUrl: string | null;
  protocolNumber: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  signedAt: string | null;
  createdAt: string;
  doctor: {
    id: string;
    name: string;
    crm: string;
    ufCrm: string;
  };
  prescription: {
    id: string;
    productName: string;
  } | null;
}

export interface DashboardSummary {
  patient: {
    id: string;
    name: string;
    pipelineStatus: string;
  };
  nextConsultation: {
    id: string;
    type: string;
    status: string;
    scheduledAt: string;
    duration: number;
    dailyRoomUrl: string | null;
    doctor: {
      name: string;
      avatarUrl: string | null;
      specialty: string | null;
    };
  } | null;
  stats: {
    activePrescriptions: number;
    pendingDocuments: number;
    anvisaStatus: string | null;
    anvisaExpires: string | null;
  };
  organization: {
    id: string;
    name: string;
    logo: string | null;
    phone: string | null;
    email: string | null;
  };
}

// Mock data for development
const MOCK_DASHBOARD: DashboardSummary = {
  patient: {
    id: '1',
    name: 'Paciente Teste',
    pipelineStatus: 'LEAD',
  },
  nextConsultation: null,
  stats: {
    activePrescriptions: 0,
    pendingDocuments: 3,
    anvisaStatus: null,
    anvisaExpires: null,
  },
  organization: {
    id: '1',
    name: 'Clinica Exemplo',
    logo: null,
    phone: '(11) 99999-9999',
    email: 'contato@clinica.com',
  },
};

const MOCK_CONSULTATIONS = {
  consultations: [],
  upcoming: 0,
  completed: 0,
};

const MOCK_PRESCRIPTIONS = {
  prescriptions: [],
  active: 0,
  expired: 0,
};

const MOCK_DOCUMENTS = {
  documents: [],
  requiredDocuments: [
    { type: 'RG', label: 'RG ou CNH', required: true, uploaded: false, documents: [] },
    { type: 'CPF', label: 'CPF', required: true, uploaded: false, documents: [] },
    { type: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residencia', required: true, uploaded: false, documents: [] },
    { type: 'LAUDO_ANTERIOR', label: 'Exames/Laudos Anteriores', required: false, uploaded: false, documents: [] },
  ],
  totalUploaded: 0,
  requiredMissing: 3,
};

/**
 * Hook para buscar dashboard do paciente
 */
export function usePatientDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ['patient-portal', 'dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/dashboard');
        return response.data;
      } catch (error) {
        console.log('[usePatientDashboard] Using mock data');
        return MOCK_DASHBOARD;
      }
    },
    refetchInterval: 60000,
  });
}

/**
 * Hook para buscar perfil do paciente
 */
export function usePatientProfile() {
  return useQuery<PatientProfile>({
    queryKey: ['patient-portal', 'profile'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/profile');
        return response.data;
      } catch (error) {
        console.log('[usePatientProfile] Using mock data');
        throw error;
      }
    },
  });
}

/**
 * Hook para buscar consultas do paciente
 */
export function usePatientConsultations() {
  return useQuery<{
    consultations: PatientConsultation[];
    upcoming: number;
    completed: number;
  }>({
    queryKey: ['patient-portal', 'consultations'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/consultations');
        return response.data;
      } catch (error) {
        console.log('[usePatientConsultations] Using mock data');
        return MOCK_CONSULTATIONS;
      }
    },
  });
}

/**
 * Hook para buscar prescricoes do paciente
 */
export function usePatientPrescriptions() {
  return useQuery<{
    prescriptions: PatientPrescription[];
    active: number;
    expired: number;
  }>({
    queryKey: ['patient-portal', 'prescriptions'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/prescriptions');
        return response.data;
      } catch (error) {
        console.log('[usePatientPrescriptions] Using mock data');
        return MOCK_PRESCRIPTIONS;
      }
    },
  });
}

/**
 * Hook para buscar documentos do paciente
 */
export function usePatientDocuments() {
  return useQuery<{
    documents: PatientDocument[];
    requiredDocuments: RequiredDocument[];
    totalUploaded: number;
    requiredMissing: number;
  }>({
    queryKey: ['patient-portal', 'documents'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/documents');
        return response.data;
      } catch (error) {
        console.log('[usePatientDocuments] Using mock data');
        return MOCK_DOCUMENTS;
      }
    },
  });
}

/**
 * Hook para upload de documento
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/patient-portal/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-portal', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['patient-portal', 'dashboard'] });
      toast({
        title: 'Documento enviado',
        description: 'Seu documento foi enviado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar',
        description: error.response?.data?.message || 'Erro ao enviar documento',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para deletar documento
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.delete(`/patient-portal/documents/${documentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-portal', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['patient-portal', 'dashboard'] });
      toast({
        title: 'Documento excluido',
        description: 'Seu documento foi excluido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.message || 'Erro ao excluir documento',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para buscar laudos ANVISA do paciente
 */
export function usePatientAnvisaReports() {
  return useQuery<{
    reports: PatientAnvisaReport[];
    pending: number;
    approved: number;
  }>({
    queryKey: ['patient-portal', 'anvisa-reports'],
    queryFn: async () => {
      try {
        const response = await api.get('/patient-portal/anvisa-reports');
        return response.data;
      } catch (error) {
        console.log('[usePatientAnvisaReports] Using mock data');
        return { reports: [], pending: 0, approved: 0 };
      }
    },
  });
}

// Status labels
export const CONSULTATION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  WAITING: 'Aguardando',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Finalizada',
  CANCELED: 'Cancelada',
  NO_SHOW: 'Nao compareceu',
};

export const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  PRIMEIRA_CONSULTA: 'Primeira Consulta',
  RETORNO: 'Retorno',
  AJUSTE_DOSE: 'Ajuste de Dose',
  EMERGENCIA: 'Emergencia',
};

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SIGNED: 'Assinada',
  REVOKED: 'Revogada',
};

export const ANVISA_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_SIGNATURE: 'Aguardando Assinatura',
  SIGNED: 'Assinado',
  SUBMITTED: 'Submetido',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
};

export const PIPELINE_STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  CONTATO: 'Em Contato',
  AGENDADO: 'Agendado',
  CONSULTA_REALIZADA: 'Consulta Realizada',
  EM_TRATAMENTO: 'Em Tratamento',
  INATIVO: 'Inativo',
};
