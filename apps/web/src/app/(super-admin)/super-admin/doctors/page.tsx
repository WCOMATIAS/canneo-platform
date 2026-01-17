'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Stethoscope,
  Search,
  Filter,
  Eye,
  Users,
  Calendar,
  Mail,
  Loader2,
} from 'lucide-react';
import { useSuperAdminDoctors, useSuperAdminDashboard } from '@/hooks/use-super-admin';

export default function DoctorsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: dashboardData } = useSuperAdminDashboard();
  const { data, isLoading, error } = useSuperAdminDoctors({
    page,
    limit: 10,
    search: searchTerm || undefined,
  });

  const doctors = data?.doctors || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Medicos</h1>
          <p className="text-gray-400">Gerencie todos os medicos da plataforma</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

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
              {doctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum medico encontrado</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-300 font-semibold">
                          {doctor.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{doctor.user.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {doctor.user.email}
                          </span>
                          <span>CRM {doctor.crm}-{doctor.ufCrm}</span>
                        </div>
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
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-gray-400">
                    Pagina {page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Proxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
