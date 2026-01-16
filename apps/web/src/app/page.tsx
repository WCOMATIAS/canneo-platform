'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canneo-50 to-canneo-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-canneo-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-canneo-800">CANNEO</h1>
        <p className="text-canneo-600 mt-2">Carregando...</p>
      </div>
    </div>
  );
}
