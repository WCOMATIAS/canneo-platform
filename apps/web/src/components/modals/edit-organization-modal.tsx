'use client';

import { useEffect } from 'react';
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
import { Loader2, Building2 } from 'lucide-react';

const organizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  type: z.enum(['CLINICA', 'ASSOCIACAO'], {
    required_error: 'Selecione o tipo de organizacao',
  }),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface EditOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  organization: {
    id: string;
    name: string;
    type: 'CLINICA' | 'ASSOCIACAO';
    cnpj?: string;
    phone?: string;
    email?: string;
  } | null;
}

export function EditOrganizationModal({
  open,
  onOpenChange,
  onSuccess,
  organization,
}: EditOrganizationModalProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (organization && open) {
      setValue('name', organization.name);
      setValue('type', organization.type);
      setValue('cnpj', organization.cnpj || '');
      setValue('phone', organization.phone || '');
      setValue('email', organization.email || '');
    }
  }, [organization, open, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const updateOrganization = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await api.put(`/organizations/${organization?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Organizacao atualizada',
        description: 'Os dados da organizacao foram atualizados com sucesso.',
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    updateOrganization.mutate(data);
  };

  const handleTypeChange = (value: string) => {
    setValue('type', value as 'CLINICA' | 'ASSOCIACAO');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-canneo-600" />
            Editar Organizacao
          </DialogTitle>
          <DialogDescription>
            Atualize os dados da sua clinica ou associacao
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Organizacao *</Label>
            <Input
              id="name"
              placeholder="Nome da clinica ou associacao"
              {...register('name')}
              disabled={updateOrganization.isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLINICA">Clinica</SelectItem>
                <SelectItem value="ASSOCIACAO">Associacao</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
              disabled={updateOrganization.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 0000-0000"
              {...register('phone')}
              disabled={updateOrganization.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@clinica.com.br"
              {...register('email')}
              disabled={updateOrganization.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateOrganization.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-canneo-600 hover:bg-canneo-700"
              disabled={updateOrganization.isPending}
            >
              {updateOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
