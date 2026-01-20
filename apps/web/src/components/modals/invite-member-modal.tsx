'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Email invalido'),
  role: z.enum(['ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER'], {
    required_error: 'Selecione um papel',
  }),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const ROLES = [
  { value: 'ADMIN', label: 'Administrador', description: 'Acesso total as configuracoes' },
  { value: 'DOCTOR', label: 'Medico', description: 'Pode atender pacientes e criar prontuarios' },
  { value: 'SECRETARY', label: 'Secretario', description: 'Pode gerenciar agenda e pacientes' },
  { value: 'VIEWER', label: 'Visualizador', description: 'Apenas visualizacao' },
];

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  organizationId: string;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onSuccess,
  organizationId,
}: InviteMemberModalProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedRole('');
    }
  }, [open, reset]);

  const inviteMember = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const response = await api.post(`/organizations/${organizationId}/invites`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Convite enviado',
        description: 'O convite foi enviado para o email informado.',
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar convite',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InviteFormData) => {
    inviteMember.mutate(data);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setValue('role', value as 'ADMIN' | 'DOCTOR' | 'SECRETARY' | 'VIEWER');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-canneo-600" />
            Convidar Membro
          </DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro a sua equipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome do membro"
              {...register('name')}
              disabled={inviteMember.isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                className="pl-10"
                {...register('email')}
                disabled={inviteMember.isPending}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Papel na Organizacao *</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Um email sera enviado com as instrucoes para o membro se cadastrar
              e acessar a organizacao.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inviteMember.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-canneo-600 hover:bg-canneo-700"
              disabled={inviteMember.isPending}
            >
              {inviteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Convite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
