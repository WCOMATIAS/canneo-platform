'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Loader2, Search, User, Calendar, Clock, Video } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  cpfLastFour: string;
  email: string;
}

interface PatientsResponse {
  data: Patient[];
  total: number;
}

const consultationSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  type: z.enum(['PRIMEIRA_CONSULTA', 'RETORNO', 'AJUSTE_DOSE', 'EMERGENCIA'], {
    required_error: 'Selecione o tipo de consulta',
  }),
  scheduledDate: z.string().min(1, 'Selecione a data'),
  scheduledTime: z.string().min(1, 'Selecione o horario'),
  duration: z.string().min(1, 'Selecione a duracao'),
  notes: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const CONSULTATION_TYPES = [
  { value: 'PRIMEIRA_CONSULTA', label: 'Primeira Consulta' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'AJUSTE_DOSE', label: 'Ajuste de Dose' },
  { value: 'EMERGENCIA', label: 'Emergencia' },
];

const CONSULTATION_DURATIONS = [
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora e 30 minutos' },
];

interface NewConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedPatientId?: string;
}

export function NewConsultationModal({
  open,
  onOpenChange,
  onSuccess,
  preselectedPatientId,
}: NewConsultationModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('60');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      duration: '60',
    },
  });

  // Buscar pacientes
  const { data: patientsData, isLoading: loadingPatients } = useQuery<PatientsResponse>({
    queryKey: ['patients-search-modal', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await api.get(`/patients?${params}`);
      return response.data;
    },
    enabled: open,
  });

  // Buscar paciente pre-selecionado
  useEffect(() => {
    if (preselectedPatientId && open && !selectedPatient) {
      api.get(`/patients/${preselectedPatientId}`).then((response) => {
        setSelectedPatient(response.data);
        setValue('patientId', response.data.id);
      }).catch(() => {
        // Paciente nao encontrado
      });
    }
  }, [preselectedPatientId, open, selectedPatient, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setSelectedPatient(null);
      setSelectedType('');
      setSelectedDuration('60');
      setSearchTerm('');
    }
  }, [open, reset]);

  const createConsultation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString();
      const response = await api.post('/consultations', {
        patientId: data.patientId,
        type: data.type,
        scheduledAt,
        duration: parseInt(data.duration),
        notes: data.notes,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Consulta agendada',
        description: 'A consulta foi agendada com sucesso.',
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao agendar',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    createConsultation.mutate(data);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue('patientId', patient.id);
    setSearchTerm('');
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setValue('type', value as 'PRIMEIRA_CONSULTA' | 'RETORNO' | 'AJUSTE_DOSE' | 'EMERGENCIA');
  };

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    setValue('duration', value);
  };

  const patients = patientsData?.data || [];

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-canneo-600" />
            Nova Consulta
          </DialogTitle>
          <DialogDescription>
            Agende uma nova teleconsulta com seu paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Selecao de Paciente */}
          <div className="space-y-2">
            <Label>Paciente *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-canneo-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-canneo-100 rounded-full flex items-center justify-center">
                    <span className="text-canneo-700 font-semibold text-sm">
                      {selectedPatient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedPatient.name}</p>
                    <p className="text-xs text-gray-500">
                      CPF: ***.***.***-{selectedPatient.cpfLastFour}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setValue('patientId', '');
                  }}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-canneo-600" />
                  </div>
                ) : patients.length > 0 ? (
                  <div className="border rounded-lg divide-y max-h-40 overflow-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{patient.name}</span>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <p className="text-center text-gray-500 text-sm py-2">
                    Nenhum paciente encontrado
                  </p>
                ) : null}
              </div>
            )}
            {errors.patientId && (
              <p className="text-sm text-destructive">{errors.patientId.message}</p>
            )}
          </div>

          {/* Tipo de Consulta */}
          <div className="space-y-2">
            <Label>Tipo de Consulta *</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {CONSULTATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Data *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="scheduledDate"
                  type="date"
                  min={today}
                  className="pl-10"
                  {...register('scheduledDate')}
                />
              </div>
              {errors.scheduledDate && (
                <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Horario *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="scheduledTime"
                  type="time"
                  className="pl-10"
                  {...register('scheduledTime')}
                />
              </div>
              {errors.scheduledTime && (
                <p className="text-sm text-destructive">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          {/* Duracao */}
          <div className="space-y-2">
            <Label>Duracao *</Label>
            <Select value={selectedDuration} onValueChange={handleDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a duracao" />
              </SelectTrigger>
              <SelectContent>
                {CONSULTATION_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Observacoes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <textarea
              id="notes"
              placeholder="Observacoes sobre a consulta..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createConsultation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-canneo-600 hover:bg-canneo-700"
              disabled={createConsultation.isPending}
            >
              {createConsultation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                'Agendar Consulta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
