'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  Building2,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { useSuperAdminReports, useSuperAdminDashboard } from '@/hooks/use-super-admin';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Diario' },
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensal' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function ReportsPage() {
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');

  const { data: dashboardData } = useSuperAdminDashboard();
  const { data, isLoading, error } = useSuperAdminReports({
    startDate,
    endDate,
    groupBy,
  });

  const handleExport = (type: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    alert(`Exportar como ${type.toUpperCase()} - funcionalidade em desenvolvimento`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatorios</h1>
          <p className="text-gray-400">Visualize metricas e dados consolidados da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={() => handleExport('excel')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Data Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Agrupar por</label>
              <Select value={groupBy} onValueChange={(v: 'day' | 'week' | 'month') => setGroupBy(v)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalConsultations || 0}</p>
              <p className="text-sm text-gray-400">Total de Consultas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.estimatedMonthlyRevenue || 0)}</p>
              <p className="text-sm text-gray-400">Receita Mensal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalOrganizations || 0}</p>
              <p className="text-sm text-gray-400">Organizacoes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalPatients || 0}</p>
              <p className="text-sm text-gray-400">Pacientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">Erro ao carregar relatorios</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultations by Period */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Consultas por Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.consultationsByPeriod && data.consultationsByPeriod.length > 0 ? (
                <div className="space-y-3">
                  {data.consultationsByPeriod.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{item.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-semibold">{item.count} consultas</span>
                        <span className="text-green-400 text-sm">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados para o periodo selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Users by Period */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Novos Cadastros por Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.newUsersByPeriod && data.newUsersByPeriod.length > 0 ? (
                <div className="space-y-3">
                  {data.newUsersByPeriod.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{item.date}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-400">
                          <Stethoscope className="h-3 w-3 inline mr-1" />
                          {item.doctors}
                        </span>
                        <span className="text-green-400">
                          <Users className="h-3 w-3 inline mr-1" />
                          {item.patients}
                        </span>
                        <span className="text-purple-400">
                          <Building2 className="h-3 w-3 inline mr-1" />
                          {item.organizations}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados para o periodo selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Plan */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                Receita por Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.revenueByPlan && data.revenueByPlan.length > 0 ? (
                <div className="space-y-3">
                  {data.revenueByPlan.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.plan}</p>
                        <p className="text-sm text-gray-400">{item.subscriptions} assinaturas</p>
                      </div>
                      <span className="text-green-400 font-semibold">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados de receita</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Organizations */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Top Organizacoes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.topOrganizations && data.topOrganizations.length > 0 ? (
                <div className="space-y-3">
                  {data.topOrganizations.slice(0, 5).map((org, index) => (
                    <div key={org.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-purple-900 rounded-full flex items-center justify-center text-purple-300 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium">{org.name}</p>
                          <p className="text-sm text-gray-400">{org.consultations} consultas</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-semibold">{formatCurrency(org.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados de organizacoes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
