'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { NewConsultationModal } from '@/components/modals/new-consultation-modal';

// Types
interface Consultation {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  dailyRoomUrl: string | null;
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

// Mock consultations for development
const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    type: 'PRIMEIRA_CONSULTA',
    status: 'CONFIRMED',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    dailyRoomUrl: 'https://canneo.daily.co/room-123',
    patient: {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(11) 99999-1234',
    },
  },
  {
    id: '2',
    type: 'RETORNO',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    dailyRoomUrl: null,
    patient: {
      id: '2',
      name: 'Joao Santos',
      email: 'joao@email.com',
      phone: '(11) 99999-5678',
    },
  },
];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  WAITING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  WAITING: 'Aguardando',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Finalizada',
  CANCELED: 'Cancelada',
  NO_SHOW: 'Nao compareceu',
};

const TYPE_LABELS: Record<string, string> = {
  PRIMEIRA_CONSULTA: 'Primeira Consulta',
  RETORNO: 'Retorno',
  AJUSTE_DOSE: 'Ajuste de Dose',
  EMERGENCIA: 'Emergencia',
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

function useConsultations(startDate: string, endDate: string) {
  return useQuery<{ consultations: Consultation[] }>({
    queryKey: ['consultations', startDate, endDate],
    queryFn: async () => {
      try {
        const response = await api.get('/consultations', {
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        console.log('[useConsultations] Using mock data');
        return { consultations: MOCK_CONSULTATIONS };
      }
    },
  });
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const queryClient = useQueryClient();

  // Calculate date range for the current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data, isLoading } = useConsultations(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );

  const consultations = data?.consultations || [];

  // Get days in the current month
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Get consultations for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const consultationsForSelectedDate = useMemo(() => {
    return consultations.filter((c) => {
      const consultationDate = new Date(c.scheduledAt).toISOString().split('T')[0];
      return consultationDate === selectedDateStr;
    });
  }, [consultations, selectedDateStr]);

  // Count consultations by date
  const consultationsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    consultations.forEach((c) => {
      const date = new Date(c.scheduledAt).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [consultations]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">Gerencie sua agenda de consultas</p>
        </div>
        <Button
          className="bg-canneo-600 hover:bg-canneo-700"
          onClick={() => setIsNewConsultationOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <NewConsultationModal
        open={isNewConsultationOpen}
        onOpenChange={setIsNewConsultationOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['consultations'] });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dateStr = day?.toISOString().split('T')[0] || '';
                const count = consultationsByDate[dateStr] || 0;

                return (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day}
                    className={cn(
                      'aspect-square p-1 rounded-lg text-sm relative transition-colors',
                      !day && 'invisible',
                      day && 'hover:bg-gray-100',
                      isToday(day) && 'bg-canneo-100 text-canneo-700 font-semibold',
                      isSelected(day) && 'bg-canneo-600 text-white hover:bg-canneo-700',
                      isSelected(day) && isToday(day) && 'bg-canneo-600'
                    )}
                  >
                    <span className="block">{day?.getDate()}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                          isSelected(day) ? 'bg-white' : 'bg-canneo-500'
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Selected Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm">Carregando...</p>
              </div>
            ) : consultationsForSelectedDate.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma consulta neste dia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultationsForSelectedDate.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {formatTime(consultation.scheduledAt)}
                        </span>
                      </div>
                      <Badge className={STATUS_COLORS[consultation.status]}>
                        {STATUS_LABELS[consultation.status]}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{consultation.patient.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">
                        {TYPE_LABELS[consultation.type]} - {consultation.duration}min
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {consultation.dailyRoomUrl && (
                        <Button size="sm" className="flex-1 bg-canneo-600 hover:bg-canneo-700">
                          <Video className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Proximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhuma consulta agendada
              </h3>
              <p className="text-gray-500 text-sm">
                Agende uma nova consulta para comecar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Data/Hora
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Paciente
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.slice(0, 10).map((consultation) => (
                    <tr key={consultation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(consultation.scheduledAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-canneo-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-canneo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {consultation.patient.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {consultation.patient.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {consultation.patient.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {TYPE_LABELS[consultation.type]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[consultation.status]}>
                          {STATUS_LABELS[consultation.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {consultation.dailyRoomUrl && (
                            <Button size="sm" className="bg-canneo-600 hover:bg-canneo-700">
                              <Video className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
