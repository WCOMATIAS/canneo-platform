'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';

export default function PatientDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Ola, bem-vindo ao CANNEO!
        </h1>
        <p className="text-blue-100 mt-1">
          Seu portal de acompanhamento de tratamento com cannabis medicinal
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Proxima Consulta</p>
                <p className="font-semibold text-gray-900">Nenhuma agendada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prescricoes Ativas</p>
                <p className="font-semibold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status ANVISA</p>
                <p className="font-semibold text-gray-900">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Notificacoes</p>
                <p className="font-semibold text-gray-900">0 novas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Minhas Consultas</CardTitle>
            <Link
              href="/my-consultations"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma consulta agendada</p>
              <p className="text-sm text-gray-400 mt-1">
                Aguarde o agendamento pela clinica
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Minhas Prescricoes</CardTitle>
            <Link
              href="/my-prescriptions"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma prescricao ativa</p>
              <p className="text-sm text-gray-400 mt-1">
                Suas prescricoes aparecerao aqui apos a consulta
              </p>
            </div>
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
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Cadastro Realizado</p>
                <p className="text-sm text-gray-500">Seu cadastro foi concluido com sucesso</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-500">Aguardando Consulta</p>
                <p className="text-sm text-gray-400">A clinica entrara em contato para agendar</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-400">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-500">Consulta Medica</p>
                <p className="text-sm text-gray-400">Avaliacao com o medico especialista</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-400">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-500">Prescricao e Laudo</p>
                <p className="text-sm text-gray-400">Emissao da prescricao e laudo ANVISA</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-400">5</span>
              </div>
              <div>
                <p className="font-medium text-gray-500">Autorizacao ANVISA</p>
                <p className="text-sm text-gray-400">Submissao e aprovacao pela ANVISA</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-400">6</span>
              </div>
              <div>
                <p className="font-medium text-gray-500">Inicio do Tratamento</p>
                <p className="text-sm text-gray-400">Aquisicao do medicamento e acompanhamento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
