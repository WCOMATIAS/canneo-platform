'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um numero'),
  confirmPassword: z.string(),
  crm: z.string().min(4, 'CRM invalido').max(10, 'CRM invalido'),
  ufCrm: z.string().length(2, 'Selecione o estado'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, registerLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      crm: data.crm,
      ufCrm: data.ufCrm,
    });
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
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Comece seu trial gratuito de 7 dias
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Dr. Joao Silva"
              {...register('name')}
              disabled={registerLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={registerLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* CRM + UF */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                placeholder="123456"
                {...register('crm')}
                disabled={registerLoading}
              />
              {errors.crm && (
                <p className="text-sm text-destructive">{errors.crm.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ufCrm">UF</Label>
              <select
                id="ufCrm"
                {...register('ufCrm')}
                disabled={registerLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">UF</option>
                {UF_OPTIONS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              {errors.ufCrm && (
                <p className="text-sm text-destructive">{errors.ufCrm.message}</p>
              )}
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('password')}
                disabled={registerLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('confirmPassword')}
                disabled={registerLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Ao criar uma conta, voce concorda com os{' '}
            <Link href="/terms" className="text-canneo-600 hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-canneo-600 hover:underline">
              Politica de Privacidade
            </Link>
            .
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-canneo-600 hover:bg-canneo-700"
            disabled={registerLoading}
          >
            {registerLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta Gratuita'
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Ja tem uma conta?{' '}
            <Link
              href="/auth/login"
              className="text-canneo-600 hover:underline font-medium"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
