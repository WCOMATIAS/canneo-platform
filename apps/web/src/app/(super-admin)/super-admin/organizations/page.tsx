'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Search,
  Users,
  Stethoscope,
  CreditCard,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useSuperAdminOrganizations, useSuperAdminDashboard } from '@/hooks/use-super-admin';

const ORGANIZATION_TYPES = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'CLINIC', label: 'Clinica' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'PRACTICE', label: 'Consultorio' },
  { value: 'OTHER', label: 'Outro' },
];

const SUBSCRIPTION_STATUSES = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAST_DUE', label: 'Inadimplente' },
  { value: 'CANCELED', label: 'Cancelado' },
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

function getTypeBadge(type: string) {
  const typeMap: Record<string, string> = {
    CLINIC: 'Clinica',
    HOSPITAL: 'Hospital',
    PRACTICE: 'Consultorio',
    OTHER: 'Outro',
  };
  return typeMap[type] || type;
}

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: dashboardData } = useSuperAdminDashboard();
  const { data, isLoading, error } = useSuperAdminOrganizations({
    page,
    limit: 10,
    search: searchTerm || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    subscriptionStatus: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const organizations = data?.organizations || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizacoes</h1>
          <p className="text-gray-400">Gerencie todas as organizacoes cadastradas na plataforma</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalOrganizations || 0}</p>
              <p className="text-sm text-gray-400">Total de Organizacoes</p>
            </div>
          </CardContent>
        </Card>
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
              <Calendar className="h-5 w-5 text-yellow-400" />
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
              <Stethoscope className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalDoctors || 0}</p>
              <p className="text-sm text-gray-400">Medicos na Plataforma</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ ou slug..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
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
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Organizacoes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">Erro ao carregar organizacoes</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma organizacao encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-white truncate">{org.name}</h3>
                        {getStatusBadge(org.subscription?.status || 'TRIAL')}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1 flex-wrap">
                        <span className="truncate">/{org.slug}</span>
                        <span>{getTypeBadge(org.type)}</span>
                        {org.cnpj && <span>CNPJ: {org.cnpj}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-400">
                          <Stethoscope className="h-4 w-4" />
                          <span className="font-semibold">{org._count?.doctors || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Medicos</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-400">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{org._count?.patients || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Pacientes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {org.subscription?.plan && (
                        <Badge variant="outline" className="border-purple-700 text-purple-300">
                          {org.subscription.plan.name}
                        </Badge>
                      )}
                      <Link href={`/super-admin/organizations/${org.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                    </div>
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
