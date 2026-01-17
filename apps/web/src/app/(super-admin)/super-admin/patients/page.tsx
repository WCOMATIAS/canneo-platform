'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Pill,
  FileCheck,
  Building2,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useSuperAdminPatients } from '@/hooks/use-super-admin';

const PIPELINE_STATUSES = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'FIRST_CONTACT', label: 'Primeiro Contato' },
  { value: 'SCHEDULING', label: 'Agendando' },
  { value: 'WAITING_CONSULTATION', label: 'Aguardando Consulta' },
  { value: 'IN_TREATMENT', label: 'Em Tratamento' },
  { value: 'FOLLOW_UP', label: 'Acompanhamento' },
  { value: 'INACTIVE', label: 'Inativo' },
];

function getPipelineStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    LEAD: { label: 'Lead', variant: 'outline' },
    FIRST_CONTACT: { label: 'Primeiro Contato', variant: 'secondary' },
    SCHEDULING: { label: 'Agendando', variant: 'secondary' },
    WAITING_CONSULTATION: { label: 'Aguardando Consulta', variant: 'default' },
    IN_TREATMENT: { label: 'Em Tratamento', variant: 'default' },
    FOLLOW_UP: { label: 'Acompanhamento', variant: 'default' },
    INACTIVE: { label: 'Inativo', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export default function SuperAdminPatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pipelineStatus, setPipelineStatus] = useState('all');
  const limit = 10;

  const { data, isLoading, error } = useSuperAdminPatients({
    page,
    limit,
    search: search || undefined,
    pipelineStatus: pipelineStatus !== 'all' ? pipelineStatus : undefined,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Erro ao carregar pacientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pacientes</h1>
          <p className="text-gray-400 mt-1">
            Todos os pacientes cadastrados na plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-purple-500" />
          <span className="text-2xl font-bold text-white">
            {data?.pagination.total || 0}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={pipelineStatus} onValueChange={(v) => { setPipelineStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status do Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.patients.map((patient) => (
            <Card key={patient.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-300 font-semibold">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{patient.name}</h3>
                        <p className="text-sm text-gray-400">CPF: ***.***.***-{patient.cpfLastFour}</p>
                      </div>
                      {getPipelineStatusBadge(patient.pipelineStatus)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                      {patient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.birthDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(patient.birthDate), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                      {patient.organization && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{patient.organization.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold">{patient.stats.consultations}</span>
                      </div>
                      <p className="text-xs text-gray-500">Consultas</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-400">
                        <Pill className="h-4 w-4" />
                        <span className="font-semibold">{patient.stats.prescriptions}</span>
                      </div>
                      <p className="text-xs text-gray-500">Prescricoes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-400">
                        <FileCheck className="h-4 w-4" />
                        <span className="font-semibold">{patient.stats.anvisaReports}</span>
                      </div>
                      <p className="text-xs text-gray-500">Laudos</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-400">
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold">{patient.documents.length}</span>
                      </div>
                      <p className="text-xs text-gray-500">Docs KYC</p>
                    </div>
                    <Link href={`/super-admin/patients/${patient.id}`}>
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Documents Preview */}
                {patient.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Documentos KYC:</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.documents.slice(0, 5).map((doc) => (
                        <Badge key={doc.id} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc.type}: {doc.name.slice(0, 20)}...
                        </Badge>
                      ))}
                      {patient.documents.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{patient.documents.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {data?.patients.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum paciente encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.pagination.total)} de {data.pagination.total} pacientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-400">
              Pagina {page} de {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.totalPages}
              className="border-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
