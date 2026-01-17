'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore, isPatientRole, isSuperAdmin } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  crm: string;
  ufCrm: string;
}

interface MfaVerifyData {
  code: string;
  tempToken?: string;
}

export function useAuth() {
  const router = useRouter();
  const {
    user,
    membership,
    doctorProfile,
    isAuthenticated,
    isLoading,
    setAuth,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  // Ref para evitar múltiplas chamadas
  const hasCheckedAuth = useRef(false);

  // Verificar autenticação ao carregar (apenas uma vez)
  useEffect(() => {
    const checkAuth = async () => {
      // Se já verificou ou não está carregando, não faz nada
      if (hasCheckedAuth.current) {
        return;
      }

      hasCheckedAuth.current = true;
      console.log('[useAuth] Checking auth...');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('[useAuth] No token found');
        setLoading(false);
        return;
      }

      // Se já está autenticado no store, não precisa verificar de novo
      if (isAuthenticated && membership) {
        console.log('[useAuth] Already authenticated from store');
        setLoading(false);
        return;
      }

      try {
        console.log('[useAuth] Calling /auth/me');
        const response = await api.get('/auth/me');

        // Adaptar resposta da API /me para o formato esperado
        const membershipData = response.data.membership || (response.data.organization ? {
          id: response.data.organization.id,
          role: response.data.organization.role || 'OWNER',
          organization: {
            id: response.data.organization.id,
            name: response.data.organization.name,
            slug: response.data.organization.slug,
            type: 'CLINICA' as const,
          },
        } : null);

        if (membershipData) {
          console.log('[useAuth] Auth successful, setting auth');
          setAuth({
            user: response.data.user,
            membership: membershipData,
            doctorProfile: response.data.doctorProfile,
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken') || '',
          });
        } else {
          // Sem membership, fazer logout
          console.log('[useAuth] No membership, logging out');
          storeLogout();
        }
      } catch (error: any) {
        console.log('[useAuth] Error checking auth:', error?.response?.status);
        // Só faz logout se for erro de autenticação (401)
        if (error?.response?.status === 401) {
          storeLogout();
        } else {
          // Para outros erros (como Network Error), só marca como não loading
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, membership, setAuth, setLoading, storeLogout]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.requiresMfa) {
        // Redirecionar para MFA
        localStorage.setItem('mfaTempToken', data.tempToken);
        router.push('/auth/mfa');
        return;
      }

      // Adaptar resposta da API para o formato esperado pelo store
      const membership = data.organization ? {
        id: data.organization.id,
        role: data.organization.role || 'OWNER',
        organization: {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug,
          type: 'CLINICA' as const,
        },
      } : null;

      if (!membership) {
        toast({
          title: 'Erro no login',
          description: 'Usuário não possui organização vinculada',
          variant: 'destructive',
        });
        return;
      }

      setAuth({
        user: data.user,
        membership,
        doctorProfile: data.doctorProfile,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${data.user?.name || data.user.email}`,
        variant: 'default',
      });

      // Redirecionar baseado no tipo de usuário
      if (isSuperAdmin(membership.role)) {
        router.push('/super-admin');
      } else if (isPatientRole(membership.role)) {
        router.push('/patient-dashboard');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro no login',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        membership: data.membership,
        doctorProfile: data.doctorProfile,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso.',
        variant: 'default',
      });

      router.push('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Erro no cadastro',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // MFA verify mutation
  const mfaVerifyMutation = useMutation({
    mutationFn: async (data: MfaVerifyData) => {
      const tempToken = data.tempToken || localStorage.getItem('mfaTempToken');
      const response = await api.post('/auth/mfa/verify', {
        code: data.code,
        tempToken,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.removeItem('mfaTempToken');

      setAuth({
        user: data.user,
        membership: data.membership,
        doctorProfile: data.doctorProfile,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      router.push('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Erro na verificação',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      storeLogout();
      router.push('/auth/login');
    },
    onError: () => {
      // Mesmo com erro, fazer logout local
      storeLogout();
      router.push('/auth/login');
    },
  });

  return {
    user,
    membership,
    doctorProfile,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    verifyMfa: mfaVerifyMutation.mutate,
    mfaLoading: mfaVerifyMutation.isPending,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  };
}
