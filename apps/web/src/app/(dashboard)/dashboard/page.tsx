'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Video,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';

// Dados mockados para o dashboard
const stats: Array<{
  name: string;
  value: string;
  icon: typeof Users;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}> = [
  {
    name: 'Total de Pacientes',
    value: '0',
    icon: Users,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Consultas Hoje',
    value: '0',
    icon: Calendar,
    change: '0 agendadas',
    changeType: 'neutral',
  },
  {
    name: 'Consultas Este Mes',
    value: '0',
    icon: Video,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Laudos Gerados',
    value: '0',
    icon: FileText,
    change: '+0%',
    changeType: 'neutral',
  },
];

const upcomingConsultations: Array<{
  id: string;
  patientName: string;
  time: string;
  type: string;
}> = [];

const recentPatients: Array<{
  id: string;
  name: string;
  lastVisit: string;
  status: string;
}> = [];

export default function DashboardPage() {
  const { doctorProfile, membership } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, Dr. {doctorProfile?.name?.split(' ')[0] || 'Usuario'}!
          </h1>
          <p className="text-gray-500">
            {membership?.organization?.name || 'Sua clinica'} - {' '}
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/patients/new">
            <Button className="bg-canneo-600 hover:bg-canneo-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-canneo-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-canneo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Proximas Consultas</CardTitle>
            <Link
              href="/schedule"
              className="text-sm text-canneo-600 hover:underline flex items-center gap-1"
            >
              Ver agenda <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingConsultations.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma consulta agendada</p>
                <Link href="/schedule">
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {consultation.patientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {consultation.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-canneo-600">
                        {consultation.time}
                      </p>
                      <Link href={`/consultations/${consultation.id}`}>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pacientes Recentes</CardTitle>
            <Link
              href="/patients"
              className="text-sm text-canneo-600 hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum paciente cadastrado</p>
                <Link href="/patients/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Paciente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-canneo-100 rounded-full flex items-center justify-center">
                        <span className="text-canneo-700 font-semibold">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ultima visita: {patient.lastVisit}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        patient.status === 'Ativo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acoes Rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/patients/new">
              <div className="p-4 border rounded-lg hover:border-canneo-300 hover:bg-canneo-50 transition-colors text-center cursor-pointer">
                <Users className="h-8 w-8 text-canneo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Novo Paciente
                </p>
              </div>
            </Link>
            <Link href="/schedule">
              <div className="p-4 border rounded-lg hover:border-canneo-300 hover:bg-canneo-50 transition-colors text-center cursor-pointer">
                <Calendar className="h-8 w-8 text-canneo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Agendar Consulta
                </p>
              </div>
            </Link>
            <Link href="/medical-records/new">
              <div className="p-4 border rounded-lg hover:border-canneo-300 hover:bg-canneo-50 transition-colors text-center cursor-pointer">
                <FileText className="h-8 w-8 text-canneo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Novo Prontuario
                </p>
              </div>
            </Link>
            <Link href="/anvisa-reports/new">
              <div className="p-4 border rounded-lg hover:border-canneo-300 hover:bg-canneo-50 transition-colors text-center cursor-pointer">
                <TrendingUp className="h-8 w-8 text-canneo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Laudo ANVISA
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
