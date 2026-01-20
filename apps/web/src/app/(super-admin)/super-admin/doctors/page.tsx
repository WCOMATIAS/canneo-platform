'use client';

import { useState, useRef, useEffect } from 'react';
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
  Stethoscope,
  Search,
  Filter,
  Eye,
  Users,
  Calendar,
  Mail,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserPlus,
} from 'lucide-react';
import { useSuperAdminDoctors, useSuperAdminDashboard, useSuperAdminOrganizations } from '@/hooks/use-super-admin';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

const SPECIALTY_OPTIONS = [
  { value: 'all', label: 'Todas as Especialidades' },
  { value: 'Clinico Geral', label: 'Clinico Geral' },
  { value: 'Psiquiatria', label: 'Psiquiatria' },
  { value: 'Neurologia', label: 'Neurologia' },
  { value: 'Dor Cronica', label: 'Dor Cronica' },
  { value: 'Oncologia', label: 'Oncologia' },
  { value: 'Pediatria', label: 'Pediatria' },
  { value: 'Geriatria', label: 'Geriatria' },
];

export default function DoctorsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const filterRef = useRef<HTMLDivElement>(null);

  const { data: dashboardData } = useSuperAdminDashboard();
  const { data: organizationsData } = useSuperAdminOrganizations({ page: 1, limit: 100 });
  const { data, isLoading, error } = useSuperAdminDoctors({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' : undefined,
  });

  const doctors = data?.doctors || [];
  const pagination = data?.pagination;
  const organizations = organizationsData?.organizations || [];

  // Filter doctors by specialty and organization (client-side for now)
  const filteredDoctors = doctors.filter((doctor) => {
    if (specialtyFilter !== 'all' && doctor.specialty !== specialtyFilter) {
      return false;
    }
    if (organizationFilter !== 'all') {
      const hasOrg = doctor.user.memberships.some(m => m.organization.id === organizationFilter);
      if (!hasOrg) return false;
    }
    return true;
  });

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount = [statusFilter, specialtyFilter, organizationFilter].filter(f => f !== 'all').length;

  const clearFilters = () => {
    setStatusFilter('all');
    setSpecialtyFilter('all');
    setOrganizationFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Medicos</h1>
          <p className="text-gray-400">Gerencie todos os medicos da plataforma</p>
        </div>
        <div className="flex gap-3">
          {/* Filter Button with Dropdown */}
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-purple-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <h3 className="font-semibold text-white">Filtros</h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-400 hover:text-purple-300"
                        onClick={clearFilters}
                      >
                        Limpar filtros
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialty Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Especialidade</label>
                    <Select value={specialtyFilter} onValueChange={(v) => { setSpecialtyFilter(v); setPage(1); }}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Organization Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Organizacao</label>
                    <Select value={organizationFilter} onValueChange={(v) => { setOrganizationFilter(v); setPage(1); }}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Organizacoes</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Link href="/super-admin/doctors/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Medico
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Filtros ativos:</span>
          {statusFilter !== 'all' && (
            <Badge variant="outline" className="border-purple-700 text-purple-300">
              Status: {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
              <button
                className="ml-1 hover:text-white"
                onClick={() => setStatusFilter('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {specialtyFilter !== 'all' && (
            <Badge variant="outline" className="border-purple-700 text-purple-300">
              Especialidade: {specialtyFilter}
              <button
                className="ml-1 hover:text-white"
                onClick={() => setSpecialtyFilter('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {organizationFilter !== 'all' && (
            <Badge variant="outline" className="border-purple-700 text-purple-300">
              Org: {organizations.find(o => o.id === organizationFilter)?.name}
              <button
                className="ml-1 hover:text-white"
                onClick={() => setOrganizationFilter('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou CRM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalDoctors || 0}</p>
              <p className="text-sm text-gray-400">Total de Medicos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalPatients || 0}</p>
              <p className="text-sm text-gray-400">Pacientes Totais</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dashboardData?.totalConsultations || 0}</p>
              <p className="text-sm text-gray-400">Consultas Totais</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Medicos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Erro ao carregar medicos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum medico encontrado</p>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="link"
                      className="text-purple-400 hover:text-purple-300 mt-2"
                      onClick={clearFilters}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-300 font-semibold">
                          {doctor.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{doctor.user.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {doctor.user.email}
                          </span>
                          <span>CRM {doctor.crm}-{doctor.ufCrm}</span>
                          {doctor.specialty && (
                            <Badge variant="outline" className="border-blue-700 text-blue-300">
                              {doctor.specialty}
                            </Badge>
                          )}
                        </div>
                        {doctor.user.memberships.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Building2 className="h-3 w-3" />
                            {doctor.user.memberships.map(m => m.organization.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-white font-semibold">{doctor.stats.consultations}</p>
                        <p className="text-xs text-gray-400">Consultas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">{doctor.stats.medicalRecords}</p>
                        <p className="text-xs text-gray-400">Prontuarios</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">{doctor.stats.anvisaReports}</p>
                        <p className="text-xs text-gray-400">Laudos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          doctor.user.memberships.some(m => m.role !== 'PATIENT')
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-gray-600 text-gray-400'
                        }`}
                      >
                        Ativo
                      </span>
                      <Link href={`/super-admin/doctors/${doctor.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}

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
