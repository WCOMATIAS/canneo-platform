'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  Stethoscope,
  FileText,
  ClipboardList,
  Search,
  AlertCircle,
  Leaf,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  cpfLastFour: string;
  email: string;
  birthDate: string;
}

interface PatientsResponse {
  data: Patient[];
  total: number;
}

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  // Anamnese
  mainComplaint: z.string().min(10, 'Descreva a queixa principal'),
  historyOfPresentIllness: z.string().min(10, 'Descreva a historia da doenca'),
  pastMedicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  socialHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  // Exame Fisico
  vitalSigns: z.string().optional(),
  physicalExamFindings: z.string().optional(),
  // Diagnostico
  diagnosis: z.string().min(3, 'Informe o diagnostico'),
  icd10Code: z.string().optional(),
  // Cannabis Medicinal
  cannabisIndication: z.string().min(10, 'Descreva a indicacao para cannabis medicinal'),
  previousTreatments: z.string().optional(),
  treatmentObjectives: z.string().optional(),
  // Prescricao
  recommendedProduct: z.string().optional(),
  recommendedDosage: z.string().optional(),
  administrationRoute: z.string().optional(),
  // Observacoes
  observations: z.string().optional(),
  followUpDate: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

const COMMON_ICD10_CODES = [
  { value: 'F32', label: 'F32 - Episodio depressivo' },
  { value: 'F41', label: 'F41 - Transtornos ansiosos' },
  { value: 'G40', label: 'G40 - Epilepsia' },
  { value: 'G43', label: 'G43 - Enxaqueca' },
  { value: 'G89', label: 'G89 - Dor cronica' },
  { value: 'M54', label: 'M54 - Dorsalgia' },
  { value: 'R52', label: 'R52 - Dor nao especificada' },
  { value: 'G47', label: 'G47 - Disturbios do sono' },
  { value: 'F90', label: 'F90 - TDAH' },
  { value: 'G35', label: 'G35 - Esclerose multipla' },
];

const ADMINISTRATION_ROUTES = [
  { value: 'ORAL', label: 'Oral (oleo sublingual)' },
  { value: 'INALACAO', label: 'Inalacao' },
  { value: 'TOPICO', label: 'Topico' },
  { value: 'OUTRO', label: 'Outro' },
];

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedIcd10, setSelectedIcd10] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
  });

  // Buscar pacientes
  const { data: patientsData, isLoading: loadingPatients } = useQuery<PatientsResponse>({
    queryKey: ['patients-search', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await api.get(`/patients?${params}`);
      return response.data;
    },
  });

  // Buscar paciente pre-selecionado
  useEffect(() => {
    if (preselectedPatientId && !selectedPatient) {
      api.get(`/patients/${preselectedPatientId}`).then((response) => {
        setSelectedPatient(response.data);
        setValue('patientId', response.data.id);
      }).catch(() => {
        // Paciente nao encontrado
      });
    }
  }, [preselectedPatientId, selectedPatient, setValue]);

  const createMedicalRecord = useMutation({
    mutationFn: async (data: MedicalRecordFormData) => {
      const response = await api.post('/medical-records', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Prontuario criado',
        description: 'O prontuario foi criado com sucesso.',
      });
      router.push('/medical-records');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar prontuario',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: MedicalRecordFormData) => {
    createMedicalRecord.mutate(data);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue('patientId', patient.id);
    setSearchTerm('');
  };

  const handleIcd10Change = (value: string) => {
    setSelectedIcd10(value);
    setValue('icd10Code', value);
  };

  const handleRouteChange = (value: string) => {
    setSelectedRoute(value);
    setValue('administrationRoute', value);
  };

  const patients = patientsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/medical-records">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Prontuario</h1>
          <p className="text-gray-500">Crie um novo prontuario medico para o paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selecao de Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-canneo-600" />
              Paciente
            </CardTitle>
            <CardDescription>Selecione o paciente para este prontuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-canneo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-canneo-100 rounded-full flex items-center justify-center">
                    <span className="text-canneo-700 font-semibold">
                      {selectedPatient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    <p className="text-sm text-gray-500">
                      CPF: ***.***.***-{selectedPatient.cpfLastFour}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedPatient(null);
                    setValue('patientId', '');
                  }}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-canneo-600" />
                  </div>
                ) : patients.length > 0 ? (
                  <div className="border rounded-lg divide-y max-h-60 overflow-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <div className="w-8 h-8 bg-canneo-100 rounded-full flex items-center justify-center">
                          <span className="text-canneo-700 font-semibold text-sm">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            CPF: ***.***.***-{patient.cpfLastFour}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum paciente encontrado
                  </p>
                ) : null}
              </div>
            )}
            {errors.patientId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.patientId.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Anamnese */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-canneo-600" />
              Anamnese
            </CardTitle>
            <CardDescription>Historia clinica do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mainComplaint">Queixa Principal *</Label>
              <textarea
                id="mainComplaint"
                placeholder="Descreva a queixa principal do paciente"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('mainComplaint')}
                disabled={createMedicalRecord.isPending}
              />
              {errors.mainComplaint && (
                <p className="text-sm text-destructive">{errors.mainComplaint.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyOfPresentIllness">Historia da Doenca Atual *</Label>
              <textarea
                id="historyOfPresentIllness"
                placeholder="Descreva a evolucao da doenca atual"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('historyOfPresentIllness')}
                disabled={createMedicalRecord.isPending}
              />
              {errors.historyOfPresentIllness && (
                <p className="text-sm text-destructive">{errors.historyOfPresentIllness.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pastMedicalHistory">Historia Patologica Pregressa</Label>
                <textarea
                  id="pastMedicalHistory"
                  placeholder="Doencas previas, cirurgias, internacoes..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('pastMedicalHistory')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyHistory">Historia Familiar</Label>
                <textarea
                  id="familyHistory"
                  placeholder="Doencas na familia..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('familyHistory')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialHistory">Historia Social</Label>
                <textarea
                  id="socialHistory"
                  placeholder="Habitos de vida, ocupacao..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('socialHistory')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Medicamentos em Uso</Label>
                <textarea
                  id="currentMedications"
                  placeholder="Liste os medicamentos atuais..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('currentMedications')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exame Fisico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-canneo-600" />
              Exame Fisico
            </CardTitle>
            <CardDescription>Achados do exame fisico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vitalSigns">Sinais Vitais</Label>
                <Input
                  id="vitalSigns"
                  placeholder="PA, FC, FR, Temp, SpO2..."
                  {...register('vitalSigns')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="physicalExamFindings">Achados do Exame Fisico</Label>
                <textarea
                  id="physicalExamFindings"
                  placeholder="Descreva os achados relevantes do exame fisico..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('physicalExamFindings')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-canneo-600" />
              Diagnostico
            </CardTitle>
            <CardDescription>Diagnostico e codigo CID-10</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnostico *</Label>
                <Input
                  id="diagnosis"
                  placeholder="Diagnostico principal"
                  {...register('diagnosis')}
                  disabled={createMedicalRecord.isPending}
                />
                {errors.diagnosis && (
                  <p className="text-sm text-destructive">{errors.diagnosis.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icd10Code">Codigo CID-10</Label>
                <Select value={selectedIcd10} onValueChange={handleIcd10Change}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o CID-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ICD10_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cannabis Medicinal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="h-5 w-5 text-canneo-600" />
              Cannabis Medicinal
            </CardTitle>
            <CardDescription>Indicacao e plano terapeutico com cannabis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cannabisIndication">Indicacao para Cannabis Medicinal *</Label>
              <textarea
                id="cannabisIndication"
                placeholder="Justificativa para o uso de cannabis medicinal..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('cannabisIndication')}
                disabled={createMedicalRecord.isPending}
              />
              {errors.cannabisIndication && (
                <p className="text-sm text-destructive">{errors.cannabisIndication.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousTreatments">Tratamentos Anteriores</Label>
                <textarea
                  id="previousTreatments"
                  placeholder="Tratamentos ja tentados sem sucesso..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('previousTreatments')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentObjectives">Objetivos do Tratamento</Label>
                <textarea
                  id="treatmentObjectives"
                  placeholder="Metas esperadas com o tratamento..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('treatmentObjectives')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendedProduct">Produto Recomendado</Label>
                <Input
                  id="recommendedProduct"
                  placeholder="Ex: Oleo Full Spectrum CBD"
                  {...register('recommendedProduct')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedDosage">Posologia Recomendada</Label>
                <Input
                  id="recommendedDosage"
                  placeholder="Ex: 0,5ml 2x ao dia"
                  {...register('recommendedDosage')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="administrationRoute">Via de Administracao</Label>
                <Select value={selectedRoute} onValueChange={handleRouteChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a via" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMINISTRATION_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observacoes e Retorno */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observacoes e Retorno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observacoes Adicionais</Label>
                <textarea
                  id="observations"
                  placeholder="Outras informacoes relevantes..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('observations')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpDate">Data de Retorno</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  {...register('followUpDate')}
                  disabled={createMedicalRecord.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botoes */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/medical-records">
            <Button type="button" variant="outline" disabled={createMedicalRecord.isPending}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-canneo-600 hover:bg-canneo-700"
            disabled={createMedicalRecord.isPending}
          >
            {createMedicalRecord.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Prontuario'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
