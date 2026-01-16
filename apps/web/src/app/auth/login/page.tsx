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

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha obrigatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
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
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para continuar
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={loginLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-canneo-600 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('password')}
                disabled={loginLoading}
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
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-canneo-600 hover:bg-canneo-700"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Nao tem uma conta?{' '}
            <Link
              href="/auth/register"
              className="text-canneo-600 hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
