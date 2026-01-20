'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  Video,
  Clock,
  Bell,
  ArrowRight,
  CheckCircle,
  Upload,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  usePatientDashboard,
  CONSULTATION_TYPE_LABELS,
  ANVISA_STATUS_LABELS,
  PIPELINE_STATUS_LABELS,
} from '@/hooks/use-patient-portal';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PatientDashboardPage() {
  const { data, isLoading } = usePatientDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const dashboard = data;
  const nextConsultation = dashboard?.nextConsultation;
  const stats = dashboard?.stats;

  // Determine current step in the journey based on pipeline status
  const getStepStatus = (step: number) => {
    const status = dashboard?.patient?.pipelineStatus || 'LEAD';
    const stepMap: Record<string, number> = {
      LEAD: 1,
      CONTATO: 2,
      AGENDADO: 3,
      CONSULTA_REALIZADA: 4,
      EM_TRATAMENTO: 5,
    };
    const currentStep = stepMap[status] || 1;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Ola, {dashboard?.patient?.name || 'bem-vindo'}!
        </h1>
        <p className="text-blue-100 mt-1">
          Seu portal de acompanhamento de tratamento com cannabis medicinal
        </p>
        {dashboard?.organization && (
          <p className="text-blue-200 text-sm mt-2">
            Clinica: {dashboard.organization.name}
          </p>
        )}
      </div>

      {/* Pending documents alert */}
      {stats && stats.pendingDocuments > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Documentos pendentes</p>
              <p className="text-sm text-amber-700">
                Voce tem {stats.pendingDocuments} documento(s) obrigatorio(s) pendente(s) de envio.
              </p>
            </div>
            <Link href="/my-documents">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <Upload className="h-4 w-4 mr-1" />
                Enviar
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/my-consultations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proxima Consulta</p>
                  {nextConsultation ? (
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(nextConsultation.scheduledAt)}
                    </p>
                  ) : (
                    <p className="font-semibold text-gray-900">Nenhuma agendada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/my-prescriptions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prescricoes Ativas</p>
                  <p className="font-semibold text-gray-900">{stats?.activePrescriptions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status ANVISA</p>
                <p className="font-semibold text-gray-900">
                  {stats?.anvisaStatus ? ANVISA_STATUS_LABELS[stats.anvisaStatus] : 'Pendente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/my-documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stats?.pendingDocuments && stats.pendingDocuments > 0
                    ? 'bg-orange-100'
                    : 'bg-green-100'
                }`}>
                  <Upload className={`h-6 w-6 ${
                    stats?.pendingDocuments && stats.pendingDocuments > 0
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documentos</p>
                  <p className="font-semibold text-gray-900">
                    {stats?.pendingDocuments && stats.pendingDocuments > 0
                      ? `${stats.pendingDocuments} pendente(s)`
                      : 'Completo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming consultation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Proxima Consulta</CardTitle>
            <Link
              href="/my-consultations"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {nextConsultation ? (
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 mb-2">
                      {CONSULTATION_TYPE_LABELS[nextConsultation.type]}
                    </Badge>
                    <p className="font-medium text-gray-900">
                      {formatDate(nextConsultation.scheduledAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Duracao</p>
                    <p className="font-medium">{nextConsultation.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr(a). {nextConsultation.doctor.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nextConsultation.doctor.specialty || 'Medicina Canabinoide'}
                    </p>
                  </div>
                </div>
                {nextConsultation.dailyRoomUrl && (
                  <a
                    href={nextConsultation.dailyRoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na Sala
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma consulta agendada</p>
                <p className="text-sm text-gray-400 mt-1">
                  Aguarde o agendamento pela clinica
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acesso Rapido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/my-prescriptions" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Minhas Prescricoes</p>
                  <p className="text-sm text-gray-500">Acesse suas prescricoes e receitas</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>

            <Link href="/my-documents" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Meus Documentos</p>
                  <p className="text-sm text-gray-500">Envie documentos para ANVISA</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>

            <Link href="/my-profile" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Meu Perfil</p>
                  <p className="text-sm text-gray-500">Gerencie seus dados pessoais</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>

            <Link href="/patient-help" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Ajuda e Suporte</p>
                  <p className="text-sm text-gray-500">Duvidas frequentes e contato</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Timeline / Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sua Jornada de Tratamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Cadastro Realizado', description: 'Seu cadastro foi concluido com sucesso' },
              { step: 2, title: 'Em Contato', description: 'A clinica esta em contato com voce' },
              { step: 3, title: 'Consulta Agendada', description: 'Avaliacao com o medico especialista' },
              { step: 4, title: 'Prescricao e Laudo', description: 'Emissao da prescricao e laudo ANVISA' },
              { step: 5, title: 'Autorizacao ANVISA', description: 'Submissao e aprovacao pela ANVISA' },
              { step: 6, title: 'Em Tratamento', description: 'Aquisicao do medicamento e acompanhamento' },
            ].map((item) => {
              const status = getStepStatus(item.step);
              return (
                <div key={item.step} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : status === 'current' ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : (
                      <span className="text-sm font-medium text-gray-400">{item.step}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'current' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </p>
                    <p className={`text-sm ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'current' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
