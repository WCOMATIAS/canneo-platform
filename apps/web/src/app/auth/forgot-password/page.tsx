'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
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
import { useMutation } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-canneo-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-canneo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
          <CardDescription>
            Se existe uma conta com este email, voce recebera um link para
            redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-canneo-600 rounded-xl flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-canneo-800">CANNEO</span>
        </div>
        <CardTitle className="text-2xl font-bold">Esqueceu a Senha?</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de recuperacao
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
              disabled={mutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-canneo-600 hover:bg-canneo-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperacao'
            )}
          </Button>

          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
