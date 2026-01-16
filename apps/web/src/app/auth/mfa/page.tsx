'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function MfaPage() {
  const router = useRouter();
  const { verifyMfa, mfaLoading } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Verificar se existe tempToken
    const tempToken = localStorage.getItem('mfaTempToken');
    if (!tempToken) {
      router.push('/auth/login');
    }
    // Focus no primeiro input
    inputRefs.current[0]?.focus();
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Se colar codigo completo
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      // Focus no ultimo preenchido ou no proximo vazio
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus no proximo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      verifyMfa({ code: fullCode });
    }
  };

  const handleResend = () => {
    // TODO: Implementar reenvio
    console.log('Resend code');
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-canneo-600 rounded-xl flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-canneo-800">CANNEO</span>
        </div>
        <CardTitle className="text-2xl font-bold">
          Verificacao em 2 Etapas
        </CardTitle>
        <CardDescription>
          Digite o codigo de 6 digitos enviado para seu email
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={mfaLoading}
                className="w-12 h-14 text-center text-2xl font-bold"
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Nao recebeu o codigo?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="text-canneo-600 hover:underline font-medium"
              disabled={mfaLoading}
            >
              Reenviar
            </button>
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-canneo-600 hover:bg-canneo-700"
            disabled={mfaLoading || code.some((d) => !d)}
          >
            {mfaLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              localStorage.removeItem('mfaTempToken');
              router.push('/auth/login');
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
