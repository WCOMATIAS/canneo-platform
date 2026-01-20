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
  FileCheck,
  Search,
  AlertCircle,
  Leaf,
  Package,
  Calendar,
  Info,
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

const anvisaReportSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  // Diagnostico
  diagnosis: z.string().min(3, 'Informe o diagnostico'),
  icd10Code: z.string().min(1, 'Selecione o codigo CID-10'),
  // Justificativa
  clinicalJustification: z.string().min(50, 'A justificativa deve ter pelo menos 50 caracteres'),
  previousTreatments: z.string().min(20, 'Descreva os tratamentos anteriores'),
  treatmentFailureReason: z.string().min(20, 'Explique o motivo da falha dos tratamentos'),
  // Produto
  productType: z.enum(['CBD', 'THC', 'CBD_THC', 'FULL_SPECTRUM'], {
    required_error: 'Selecione o tipo de produto',
  }),
  productName: z.string().min(3, 'Informe o nome do produto'),
  cbdConcentration: z.string().optional(),
  thcConcentration: z.string().optional(),
  manufacturer: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  // Posologia
  dosage: z.string().min(5, 'Informe a posologia'),
  administrationRoute: z.enum(['ORAL', 'INALACAO', 'TOPICO', 'OUTRO'], {
    required_error: 'Selecione a via de administracao',
  }),
  treatmentDuration: z.string().min(1, 'Informe a duracao do tratamento'),
  // Quantidade
  quantityRequested: z.string().min(1, 'Informe a quantidade'),
  quantityUnit: z.enum(['ML', 'MG', 'UNIDADES'], {
    required_error: 'Selecione a unidade',
  }),
  // Periodo
  treatmentStartDate: z.string().min(1, 'Informe a data de inicio'),
  treatmentEndDate: z.string().min(1, 'Informe a data de termino'),
  // Observacoes
  additionalNotes: z.string().optional(),
});

type AnvisaReportFormData = z.infer<typeof anvisaReportSchema>;

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
  { value: 'F84', label: 'F84 - Transtorno do espectro autista' },
  { value: 'G20', label: 'G20 - Doenca de Parkinson' },
  { value: 'C80', label: 'C80 - Neoplasia maligna (nausea oncologica)' },
];

const PRODUCT_TYPES = [
  { value: 'CBD', label: 'CBD isolado' },
  { value: 'THC', label: 'THC isolado' },
  { value: 'CBD_THC', label: 'CBD + THC' },
  { value: 'FULL_SPECTRUM', label: 'Full Spectrum' },
];

const ADMINISTRATION_ROUTES = [
  { value: 'ORAL', label: 'Oral (oleo sublingual)' },
  { value: 'INALACAO', label: 'Inalacao' },
  { value: 'TOPICO', label: 'Topico' },
  { value: 'OUTRO', label: 'Outro' },
];

const QUANTITY_UNITS = [
  { value: 'ML', label: 'mL' },
  { value: 'MG', label: 'mg' },
  { value: 'UNIDADES', label: 'Unidades' },
];

export default function NewAnvisaReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedIcd10, setSelectedIcd10] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnvisaReportFormData>({
    resolver: zodResolver(anvisaReportSchema),
  });

  const productType = watch('productType');

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

  const createReport = useMutation({
    mutationFn: async (data: AnvisaReportFormData) => {
      const response = await api.post('/anvisa-reports', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Laudo criado',
        description: 'O laudo ANVISA foi criado com sucesso.',
      });
      router.push('/anvisa-reports');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar laudo',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AnvisaReportFormData) => {
    createReport.mutate(data);
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

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value);
    setValue('productType', value as 'CBD' | 'THC' | 'CBD_THC' | 'FULL_SPECTRUM');
  };

  const handleRouteChange = (value: string) => {
    setSelectedRoute(value);
    setValue('administrationRoute', value as 'ORAL' | 'INALACAO' | 'TOPICO' | 'OUTRO');
  };

  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
    setValue('quantityUnit', value as 'ML' | 'MG' | 'UNIDADES');
  };

  const patients = patientsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/anvisa-reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Laudo ANVISA</h1>
          <p className="text-gray-500">Gere um laudo para autorizacao de importacao</p>
        </div>
      </div>

      {/* Informacao */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informacao importante</p>
              <p>
                Este laudo sera utilizado para solicitar autorizacao de importacao de
                produtos a base de cannabis junto a ANVISA. Certifique-se de preencher
                todas as informacoes corretamente e de acordo com a legislacao vigente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selecao de Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-canneo-600" />
              Paciente
            </CardTitle>
            <CardDescription>Selecione o paciente para este laudo</CardDescription>
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

        {/* Diagnostico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-canneo-600" />
              Diagnostico
            </CardTitle>
            <CardDescription>Informacoes do diagnostico do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnostico *</Label>
                <Input
                  id="diagnosis"
                  placeholder="Diagnostico completo"
                  {...register('diagnosis')}
                  disabled={createReport.isPending}
                />
                {errors.diagnosis && (
                  <p className="text-sm text-destructive">{errors.diagnosis.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icd10Code">Codigo CID-10 *</Label>
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
                {errors.icd10Code && (
                  <p className="text-sm text-destructive">{errors.icd10Code.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Justificativa Clinica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="h-5 w-5 text-canneo-600" />
              Justificativa Clinica
            </CardTitle>
            <CardDescription>
              Justifique a necessidade do tratamento com cannabis medicinal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicalJustification">Justificativa Medica *</Label>
              <textarea
                id="clinicalJustification"
                placeholder="Descreva detalhadamente a justificativa clinica para o uso de cannabis medicinal neste paciente..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('clinicalJustification')}
                disabled={createReport.isPending}
              />
              {errors.clinicalJustification && (
                <p className="text-sm text-destructive">{errors.clinicalJustification.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousTreatments">Tratamentos Anteriores *</Label>
                <textarea
                  id="previousTreatments"
                  placeholder="Liste os tratamentos convencionais ja tentados..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('previousTreatments')}
                  disabled={createReport.isPending}
                />
                {errors.previousTreatments && (
                  <p className="text-sm text-destructive">{errors.previousTreatments.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentFailureReason">Motivo da Falha Terapeutica *</Label>
                <textarea
                  id="treatmentFailureReason"
                  placeholder="Explique por que os tratamentos anteriores nao foram eficazes..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('treatmentFailureReason')}
                  disabled={createReport.isPending}
                />
                {errors.treatmentFailureReason && (
                  <p className="text-sm text-destructive">{errors.treatmentFailureReason.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-canneo-600" />
              Produto Solicitado
            </CardTitle>
            <CardDescription>Informacoes do produto para importacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType">Tipo de Produto *</Label>
                <Select value={selectedProductType} onValueChange={handleProductTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productType && (
                  <p className="text-sm text-destructive">{errors.productType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  placeholder="Ex: Charlotte's Web"
                  {...register('productName')}
                  disabled={createReport.isPending}
                />
                {errors.productName && (
                  <p className="text-sm text-destructive">{errors.productName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Fabricante</Label>
                <Input
                  id="manufacturer"
                  placeholder="Nome do fabricante"
                  {...register('manufacturer')}
                  disabled={createReport.isPending}
                />
              </div>

              {(productType === 'CBD' || productType === 'CBD_THC' || productType === 'FULL_SPECTRUM') && (
                <div className="space-y-2">
                  <Label htmlFor="cbdConcentration">Concentracao de CBD</Label>
                  <Input
                    id="cbdConcentration"
                    placeholder="Ex: 20mg/mL"
                    {...register('cbdConcentration')}
                    disabled={createReport.isPending}
                  />
                </div>
              )}

              {(productType === 'THC' || productType === 'CBD_THC' || productType === 'FULL_SPECTRUM') && (
                <div className="space-y-2">
                  <Label htmlFor="thcConcentration">Concentracao de THC</Label>
                  <Input
                    id="thcConcentration"
                    placeholder="Ex: 1mg/mL"
                    {...register('thcConcentration')}
                    disabled={createReport.isPending}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="countryOfOrigin">Pais de Origem</Label>
                <Input
                  id="countryOfOrigin"
                  placeholder="Ex: Estados Unidos"
                  {...register('countryOfOrigin')}
                  disabled={createReport.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posologia e Quantidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-canneo-600" />
              Posologia e Quantidade
            </CardTitle>
            <CardDescription>Dosagem e quantidade para importacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Posologia *</Label>
                <Input
                  id="dosage"
                  placeholder="Ex: 0,5mL 2x ao dia"
                  {...register('dosage')}
                  disabled={createReport.isPending}
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive">{errors.dosage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="administrationRoute">Via de Administracao *</Label>
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
                {errors.administrationRoute && (
                  <p className="text-sm text-destructive">{errors.administrationRoute.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentDuration">Duracao do Tratamento *</Label>
                <Input
                  id="treatmentDuration"
                  placeholder="Ex: 6 meses"
                  {...register('treatmentDuration')}
                  disabled={createReport.isPending}
                />
                {errors.treatmentDuration && (
                  <p className="text-sm text-destructive">{errors.treatmentDuration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityRequested">Quantidade Solicitada *</Label>
                <Input
                  id="quantityRequested"
                  placeholder="Ex: 180"
                  {...register('quantityRequested')}
                  disabled={createReport.isPending}
                />
                {errors.quantityRequested && (
                  <p className="text-sm text-destructive">{errors.quantityRequested.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unidade *</Label>
                <Select value={selectedUnit} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUANTITY_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.quantityUnit && (
                  <p className="text-sm text-destructive">{errors.quantityUnit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentStartDate">Data de Inicio do Tratamento *</Label>
                <Input
                  id="treatmentStartDate"
                  type="date"
                  {...register('treatmentStartDate')}
                  disabled={createReport.isPending}
                />
                {errors.treatmentStartDate && (
                  <p className="text-sm text-destructive">{errors.treatmentStartDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentEndDate">Data de Termino Prevista *</Label>
                <Input
                  id="treatmentEndDate"
                  type="date"
                  {...register('treatmentEndDate')}
                  disabled={createReport.isPending}
                />
                {errors.treatmentEndDate && (
                  <p className="text-sm text-destructive">{errors.treatmentEndDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observacoes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observacoes Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Observacoes</Label>
              <textarea
                id="additionalNotes"
                placeholder="Informacoes adicionais relevantes para a ANVISA..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('additionalNotes')}
                disabled={createReport.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botoes */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/anvisa-reports">
            <Button type="button" variant="outline" disabled={createReport.isPending}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-canneo-600 hover:bg-canneo-700"
            disabled={createReport.isPending}
          >
            {createReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Laudo...
              </>
            ) : (
              'Gerar Laudo ANVISA'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
