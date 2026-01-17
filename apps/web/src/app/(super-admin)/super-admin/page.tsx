'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Stethoscope,
  Building2,
  CreditCard,
  TrendingUp,
  Activity,
  FileText,
  Calendar,
  Loader2,
  Video,
} from 'lucide-react';
import { useSuperAdminDashboard } from '@/hooks/use-super-admin';

export default function SuperAdminDashboard() {
  const { data, isLoading, error } = useSuperAdminDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-400">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total de Medicos',
      value: data?.totalDoctors?.toString() || '0',
      icon: Stethoscope,
      change: `${data?.totalPatients || 0} pacientes`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/50',
    },
    {
      name: 'Organizacoes',
      value: data?.totalOrganizations?.toString() || '0',
      icon: Building2,
      change: `${data?.subscriptions?.trial || 0} em trial`,
      color: 'text-green-400',
      bgColor: 'bg-green-900/50',
    },
    {
      name: 'Total de Consultas',
      value: data?.totalConsultations?.toString() || '0',
      icon: Video,
      change: `${data?.consultationsByStatus?.COMPLETED || 0} concluidas`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/50',
    },
    {
      name: 'Assinaturas Ativas',
      value: data?.subscriptions?.active?.toString() || '0',
      icon: CreditCard,
      change: formatCurrency(data?.estimatedMonthlyRevenue || 0) + '/mes',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
        <p className="text-gray-400">Visao geral da plataforma CANNEO</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-sm mt-1 text-gray-500">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations by Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Consultas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data?.consultationsByStatus || {}).length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma consulta registrada</p>
                </div>
              ) : (
                Object.entries(data?.consultationsByStatus || {}).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-gray-300">{status}</span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Metricas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">Total de Medicos</span>
                </div>
                <span className="text-white font-semibold">{data?.totalDoctors || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Total de Pacientes</span>
                </div>
                <span className="text-white font-semibold">{data?.totalPatients || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">Total de Consultas</span>
                </div>
                <span className="text-white font-semibold">{data?.totalConsultations || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">Total de Organizacoes</span>
                </div>
                <span className="text-white font-semibold">{data?.totalOrganizations || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">Receita Estimada/Mes</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(data?.estimatedMonthlyRevenue || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
