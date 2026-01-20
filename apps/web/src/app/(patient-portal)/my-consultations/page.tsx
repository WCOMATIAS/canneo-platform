'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Video,
  Clock,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  usePatientConsultations,
  CONSULTATION_STATUS_LABELS,
  CONSULTATION_TYPE_LABELS,
} from '@/hooks/use-patient-portal';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  WAITING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

export default function MyConsultationsPage() {
  const { data, isLoading } = usePatientConsultations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const consultations = data?.consultations || [];

  // Separate upcoming and past consultations
  const now = new Date();
  const upcomingConsultations = consultations.filter(
    (c) =>
      ['SCHEDULED', 'CONFIRMED', 'WAITING'].includes(c.status) &&
      new Date(c.scheduledAt) > now
  );
  const pastConsultations = consultations.filter(
    (c) =>
      ['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(c.status) ||
      new Date(c.scheduledAt) <= now
  );

  // Find the next consultation
  const nextConsultation = upcomingConsultations[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
        <p className="text-gray-500">Acompanhe suas consultas agendadas e realizadas</p>
      </div>

      {/* Next consultation highlight */}
      {nextConsultation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Proxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={STATUS_COLORS[nextConsultation.status]}>
                    {CONSULTATION_STATUS_LABELS[nextConsultation.status]}
                  </Badge>
                  <Badge variant="outline">
                    {CONSULTATION_TYPE_LABELS[nextConsultation.type]}
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-blue-900">
                  {formatDate(nextConsultation.scheduledAt)}
                </p>
                <p className="text-blue-700">
                  as {formatTime(nextConsultation.scheduledAt)} ({nextConsultation.duration} min)
                </p>
                <div className="mt-2 flex items-center gap-2 text-blue-700">
                  <User className="h-4 w-4" />
                  <span>Dr(a). {nextConsultation.doctor.name}</span>
                  {nextConsultation.doctor.specialty && (
                    <span className="text-blue-600">
                      - {nextConsultation.doctor.specialty}
                    </span>
                  )}
                </div>
              </div>
              {nextConsultation.dailyRoomUrl && (
                <a
                  href={nextConsultation.dailyRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Video className="h-4 w-4 mr-2" />
                    Entrar na Sala
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No upcoming consultation */}
      {!nextConsultation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Proxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-blue-300 mx-auto mb-3" />
              <p className="text-blue-800 font-medium">Nenhuma consulta agendada</p>
              <p className="text-sm text-blue-600 mt-1">
                A clinica entrara em contato para agendar sua consulta
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming consultations */}
      {upcomingConsultations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Proximas Consultas ({upcomingConsultations.length - 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingConsultations.slice(1).map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={STATUS_COLORS[consultation.status]} variant="secondary">
                          {CONSULTATION_STATUS_LABELS[consultation.status]}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatDateTime(consultation.scheduledAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {CONSULTATION_TYPE_LABELS[consultation.type]} • Dr(a). {consultation.doctor.name}
                      </p>
                    </div>
                  </div>
                  {consultation.dailyRoomUrl && (
                    <a
                      href={consultation.dailyRoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Video className="h-4 w-4 mr-1" />
                        Entrar
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Historico de Consultas ({pastConsultations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastConsultations.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta realizada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Seu historico de consultas aparecera aqui apos sua primeira teleconsulta.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      consultation.status === 'COMPLETED'
                        ? 'bg-green-100'
                        : consultation.status === 'CANCELED'
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}>
                      {consultation.status === 'COMPLETED' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : consultation.status === 'CANCELED' ? (
                        <XCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={STATUS_COLORS[consultation.status]}>
                          {CONSULTATION_STATUS_LABELS[consultation.status]}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatDateTime(consultation.scheduledAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {CONSULTATION_TYPE_LABELS[consultation.type]} • Dr(a). {consultation.doctor.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {consultation.duration} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Como funciona a teleconsulta?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              Voce recebera um link por email ou WhatsApp antes da consulta
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              No horario agendado, clique no link para entrar na sala de video
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              Tenha seus documentos e exames em maos para mostrar ao medico
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              Apos a consulta, sua prescricao estara disponivel neste portal
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
