'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCPF, formatPhone, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  cpfLastFour: string;
  email: string;
  phone: string;
  birthDate: string;
  kanbanStatus: string;
  createdAt: string;
}

interface PatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery<PatientsResponse>({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.append('search', search);

      const response = await api.get(`/patients?${params}`);
      return response.data;
    },
  });

  const patients = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const getKanbanStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      LEAD: 'bg-gray-100 text-gray-700',
      PRIMEIRO_CONTATO: 'bg-blue-100 text-blue-700',
      AGENDADO: 'bg-yellow-100 text-yellow-700',
      EM_TRATAMENTO: 'bg-green-100 text-green-700',
      RETORNO: 'bg-purple-100 text-purple-700',
      INATIVO: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getKanbanStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      LEAD: 'Lead',
      PRIMEIRO_CONTATO: '1o Contato',
      AGENDADO: 'Agendado',
      EM_TRATAMENTO: 'Em Tratamento',
      RETORNO: 'Retorno',
      INATIVO: 'Inativo',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">
            Gerencie seus pacientes e acompanhe o tratamento
          </p>
        </div>
        <Link href="/patients/new">
          <Button className="bg-canneo-600 hover:bg-canneo-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF ou email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-canneo-600" />
            Lista de Pacientes
            {data && (
              <span className="text-sm font-normal text-gray-500">
                ({data.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-canneo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Erro ao carregar pacientes</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {search
                  ? 'Nenhum paciente encontrado'
                  : 'Nenhum paciente cadastrado'}
              </p>
              {!search && (
                <Link href="/patients/new">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Paciente
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        CPF
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Contato
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Cadastro
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
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
                                {formatDate(patient.birthDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ***.***.***-{patient.cpfLastFour}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{patient.email}</p>
                          <p className="text-sm text-gray-500">
                            {formatPhone(patient.phone)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getKanbanStatusColor(
                              patient.kanbanStatus
                            )}`}
                          >
                            {getKanbanStatusLabel(patient.kanbanStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/patients/${patient.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/medical-records?patientId=${patient.id}`}>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/schedule?patientId=${patient.id}`}>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
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
                            CPF: ***.***.***-{patient.cpfLastFour}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getKanbanStatusColor(
                          patient.kanbanStatus
                        )}`}
                      >
                        {getKanbanStatusLabel(patient.kanbanStatus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{patient.email}</span>
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Pagina {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
