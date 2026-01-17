'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { PatientSidebar } from '@/components/layout/patient-sidebar';
import { PatientHeader } from '@/components/layout/patient-header';
import { Loader2 } from 'lucide-react';

export default function PatientPortalLayout({
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
    // Se for medico/admin, redirecionar para dashboard medico
    if (!isLoading && isAuthenticated && membership?.role !== 'PATIENT') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, membership, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-canneo-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="lg:pl-64">
        <PatientHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
