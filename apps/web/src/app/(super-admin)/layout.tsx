'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SuperAdminSidebar } from '@/components/layout/super-admin-sidebar';
import { SuperAdminHeader } from '@/components/layout/super-admin-header';
import { Loader2 } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, membership } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    // Apenas SUPER_ADMIN pode acessar
    if (!isLoading && isAuthenticated && membership?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, membership, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || membership?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <SuperAdminSidebar />
      <div className="lg:pl-64">
        <SuperAdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
