'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Building2,
  Calendar,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useSuperAdminSubscriptions, useSuperAdminDashboard, useSuperAdminPlans } from '@/hooks/use-super-admin';

const SUBSCRIPTION_STATUSES = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAST_DUE', label: 'Inadimplente' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'EXPIRED', label: 'Expirado' },
];

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    TRIAL: { label: 'Trial', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    ACTIVE: { label: 'Ativo', className: 'bg-green-900/50 text-green-400 border-green-700' },
    PAST_DUE: { label: 'Inadimplente', className: 'bg-red-900/50 text-red-400 border-red-700' },
    CANCELED: { label: 'Cancelado', className: 'bg-gray-600 text-gray-300 border-gray-500' },
    EXPIRED: { label: 'Expirado', className: 'bg-gray-600 text-gray-300 border-gray-500' },
  };
  const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-600 text-gray-300' };
  return (
    <Badge variant="outline" className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const { data: dashboardData } = useSuperAdminDashboard();
  const { data: plansData } = useSuperAdminPlans();
  const { data, isLoading, error } = useSuperAdminSubscriptions({
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    planId: planFilter !== 'all' ? planFilter : undefined,
  });

  const subscriptions = data?.subscriptions || [];
  const pagination = data?.pagination;
  const plans = plansData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assinaturas</h1>
          <p className="text-gray-400">Gerencie as assinaturas e faturamento da plataforma</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.subscriptions?.active || 0}</p>
              <p className="text-sm text-gray-400">Assinaturas Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.subscriptions?.trial || 0}</p>
              <p className="text-sm text-gray-400">Em Trial</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-400" />
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
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalOrganizations || 0}</p>
              <p className="text-sm text-gray-400">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Planos</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">Erro ao carregar assinaturas</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma assinatura encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-green-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-white truncate">
                          {subscription.organization.name}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          /{subscription.organization.slug}
                        </span>
                        <Badge variant="outline" className="border-purple-700 text-purple-300">
                          {subscription.plan.name}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Valor</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(subscription.plan.monthlyPrice)}/mes
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Inicio</p>
                        <p className="text-white">
                          {formatDate(subscription.currentPeriodStart)}
                        </p>
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-gray-500">Renovacao</p>
                        <p className="text-white">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    <Link href={`/super-admin/organizations/${subscription.organization.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Org
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, pagination.total)} de {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-400">
                      Pagina {page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
