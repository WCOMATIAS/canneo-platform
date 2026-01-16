'use client';

import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
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

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setAuth({
          user: response.data.user,
          membership: response.data.membership,
          doctorProfile: response.data.doctorProfile,
          accessToken: token,
          refreshToken: localStorage.getItem('refreshToken') || '',
        });
      } catch (error) {
        storeLogout();
      }
    };

    if (isLoading) {
      checkAuth();
    }
  }, [isLoading, setAuth, setLoading, storeLogout]);

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

      setAuth({
        user: data.user,
        membership: data.membership,
        doctorProfile: data.doctorProfile,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${data.doctorProfile?.name || data.user.email}`,
        variant: 'default',
      });

      router.push('/dashboard');
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
