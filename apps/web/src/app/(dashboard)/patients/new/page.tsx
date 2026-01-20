'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { api, getErrorMessage } from '@/lib/api';
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
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
} from 'lucide-react';

const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 digitos')
    .max(14, 'CPF invalido')
    .transform((val) => val.replace(/\D/g, '')),
  email: z.string().email('Email invalido'),
  phone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 digitos')
    .transform((val) => val.replace(/\D/g, '')),
  birthDate: z.string().min(1, 'Data de nascimento obrigatoria'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Selecione o sexo',
  }),
  // Endereco
  zipCode: z
    .string()
    .optional()
    .transform((val) => val?.replace(/\D/g, '')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  // Informacoes medicas
  healthInsurance: z.string().optional(),
  healthInsuranceNumber: z.string().optional(),
  allergies: z.string().optional(),
  observations: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

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

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const createPatient = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const response = await api.post('/patients', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Paciente cadastrado',
        description: 'O paciente foi cadastrado com sucesso.',
      });
      router.push('/patients');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cadastrar',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PatientFormData) => {
    createPatient.mutate(data);
  };

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
    setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER');
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setValue('state', value);
  };

  const formatCPFInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    e.target.value = value;
  };

  const formatPhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    e.target.value = value;
  };

  const formatCEPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    e.target.value = value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-gray-500">Preencha os dados para cadastrar um novo paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-canneo-600" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Informacoes basicas do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Nome completo do paciente"
                  {...register('name')}
                  disabled={createPatient.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  onChange={(e) => {
                    formatCPFInput(e);
                    register('cpf').onChange(e);
                  }}
                  disabled={createPatient.isPending}
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive">{errors.cpf.message}</p>
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
                    disabled={createPatient.isPending}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    {...register('phone')}
                    onChange={(e) => {
                      formatPhoneInput(e);
                      register('phone').onChange(e);
                    }}
                    disabled={createPatient.isPending}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthDate"
                    type="date"
                    className="pl-10"
                    {...register('birthDate')}
                    disabled={createPatient.isPending}
                  />
                </div>
                {errors.birthDate && (
                  <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Sexo *</Label>
                <Select value={selectedGender} onValueChange={handleGenderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Feminino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereco */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-canneo-600" />
              Endereco
            </CardTitle>
            <CardDescription>Informacoes de endereco do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  placeholder="00000-000"
                  {...register('zipCode')}
                  onChange={(e) => {
                    formatCEPInput(e);
                    register('zipCode').onChange(e);
                  }}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  {...register('street')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Numero</Label>
                <Input
                  id="number"
                  placeholder="123"
                  {...register('number')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Apto, Bloco, etc"
                  {...register('complement')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Nome do bairro"
                  {...register('neighborhood')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Nome da cidade"
                  {...register('city')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informacoes Medicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-canneo-600" />
              Informacoes Medicas
            </CardTitle>
            <CardDescription>Dados de saude e convenio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="healthInsurance">Convenio</Label>
                <Input
                  id="healthInsurance"
                  placeholder="Nome do convenio"
                  {...register('healthInsurance')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthInsuranceNumber">Numero do Convenio</Label>
                <Input
                  id="healthInsuranceNumber"
                  placeholder="Numero da carteirinha"
                  {...register('healthInsuranceNumber')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Input
                  id="allergies"
                  placeholder="Liste as alergias conhecidas"
                  {...register('allergies')}
                  disabled={createPatient.isPending}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observacoes</Label>
                <textarea
                  id="observations"
                  placeholder="Observacoes adicionais sobre o paciente"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('observations')}
                  disabled={createPatient.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botoes */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/patients">
            <Button type="button" variant="outline" disabled={createPatient.isPending}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-canneo-600 hover:bg-canneo-700"
            disabled={createPatient.isPending}
          >
            {createPatient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Paciente'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
