'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  User,
  Stethoscope,
  Mail,
  Save,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  crm: z.string().min(4, 'CRM deve ter pelo menos 4 digitos'),
  ufCrm: z.string().min(2, 'Selecione o estado do CRM'),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapa' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceara' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espirito Santo' },
  { value: 'GO', label: 'Goias' },
  { value: 'MA', label: 'Maranhao' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Para' },
  { value: 'PB', label: 'Paraiba' },
  { value: 'PR', label: 'Parana' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piaui' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondonia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'Sao Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const SPECIALTIES = [
  { value: 'CLINICA_GERAL', label: 'Clinica Geral' },
  { value: 'NEUROLOGIA', label: 'Neurologia' },
  { value: 'PSIQUIATRIA', label: 'Psiquiatria' },
  { value: 'ONCOLOGIA', label: 'Oncologia' },
  { value: 'GERIATRIA', label: 'Geriatria' },
  { value: 'REUMATOLOGIA', label: 'Reumatologia' },
  { value: 'DOR_CRONICA', label: 'Medicina da Dor' },
  { value: 'PEDIATRIA', label: 'Pediatria' },
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
  { value: 'GASTROENTEROLOGIA', label: 'Gastroenterologia' },
  { value: 'DERMATOLOGIA', label: 'Dermatologia' },
  { value: 'CARDIOLOGIA', label: 'Cardiologia' },
  { value: 'ENDOCRINOLOGIA', label: 'Endocrinologia' },
  { value: 'OUTRA', label: 'Outra' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, doctorProfile, setAuth, membership, accessToken, refreshToken } = useAuthStore();
  const [selectedUfCrm, setSelectedUfCrm] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: doctorProfile?.name || '',
      crm: doctorProfile?.crm || '',
      ufCrm: doctorProfile?.ufCrm || '',
      specialty: doctorProfile?.specialty || '',
    },
  });

  // Preencher valores iniciais quando doctorProfile estiver disponivel
  useEffect(() => {
    if (doctorProfile) {
      setValue('name', doctorProfile.name || '');
      setValue('crm', doctorProfile.crm || '');
      setValue('ufCrm', doctorProfile.ufCrm || '');
      setValue('specialty', doctorProfile.specialty || '');
      setSelectedUfCrm(doctorProfile.ufCrm || '');
      setSelectedSpecialty(doctorProfile.specialty || '');
    }
  }, [doctorProfile, setValue]);

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put('/doctors/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Atualizar o store com os novos dados
      if (user && membership && accessToken && refreshToken) {
        setAuth({
          user,
          membership,
          doctorProfile: data,
          accessToken,
          refreshToken,
        });
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informacoes foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  const handleUfCrmChange = (value: string) => {
    setSelectedUfCrm(value);
    setValue('ufCrm', value, { shouldDirty: true });
  };

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    setValue('specialty', value, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500">Atualize suas informacoes pessoais e profissionais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informacoes da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-canneo-600" />
              Informacoes da Conta
            </CardTitle>
            <CardDescription>Dados da sua conta (nao editaveis)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  O email nao pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status da Conta</Label>
                <div className="flex items-center gap-2 h-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativa
                  </span>
                  {user?.mfaEnabled && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      2FA Ativo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-canneo-600" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Suas informacoes pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  {...register('name')}
                  disabled={updateProfile.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  {...register('phone')}
                  disabled={updateProfile.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-canneo-600" />
              Dados Profissionais
            </CardTitle>
            <CardDescription>Informacoes do seu registro profissional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm">Numero do CRM *</Label>
                <Input
                  id="crm"
                  placeholder="123456"
                  {...register('crm')}
                  disabled={updateProfile.isPending}
                />
                {errors.crm && (
                  <p className="text-sm text-destructive">{errors.crm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ufCrm">Estado do CRM *</Label>
                <Select value={selectedUfCrm} onValueChange={handleUfCrmChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.value} - {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ufCrm && (
                  <p className="text-sm text-destructive">{errors.ufCrm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Certifique-se de que os dados do CRM estao corretos,
                pois serao utilizados nos laudos e prescricoes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Organizacao */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organizacao</CardTitle>
            <CardDescription>Informacoes da sua clinica ou associacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Organizacao</Label>
                <Input
                  value={membership?.organization.name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Input
                  value={membership?.organization.type === 'CLINICA' ? 'Clinica' : 'Associacao'}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Seu Papel</Label>
                <Input
                  value={
                    membership?.role === 'OWNER' ? 'Proprietario' :
                    membership?.role === 'ADMIN' ? 'Administrador' :
                    membership?.role === 'DOCTOR' ? 'Medico' :
                    membership?.role === 'SECRETARY' ? 'Secretario' :
                    membership?.role === 'VIEWER' ? 'Visualizador' :
                    membership?.role || ''
                  }
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Para alterar informacoes da organizacao, acesse a pagina de Organizacao.
            </p>
          </CardContent>
        </Card>

        {/* Botoes */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/settings">
            <Button type="button" variant="outline" disabled={updateProfile.isPending}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-canneo-600 hover:bg-canneo-700"
            disabled={updateProfile.isPending || !isDirty}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alteracoes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
