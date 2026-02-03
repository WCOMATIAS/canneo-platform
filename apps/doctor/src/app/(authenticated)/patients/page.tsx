'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  lastConsultation: string;
  totalConsultations: number;
  status: 'active' | 'inactive';
  condition: string;
  age: number;
}

const patients: Patient[] = [
  {
    id: '1',
    name: 'Maria Aparecida Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-0001',
    lastConsultation: '2024-01-15',
    totalConsultations: 5,
    status: 'active',
    condition: 'Dor crônica',
    age: 42,
  },
  {
    id: '2',
    name: 'João Pedro Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    email: 'joao.santos@email.com',
    phone: '(11) 99999-0002',
    lastConsultation: '2024-01-14',
    totalConsultations: 3,
    status: 'active',
    condition: 'Ansiedade',
    age: 35,
  },
  {
    id: '3',
    name: 'Ana Carolina Oliveira',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    email: 'ana.oliveira@email.com',
    phone: '(11) 99999-0003',
    lastConsultation: '2024-01-10',
    totalConsultations: 8,
    status: 'active',
    condition: 'Epilepsia',
    age: 28,
  },
  {
    id: '4',
    name: 'Carlos Eduardo Ferreira',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 99999-0004',
    lastConsultation: '2024-01-08',
    totalConsultations: 2,
    status: 'active',
    condition: 'Insônia',
    age: 51,
  },
  {
    id: '5',
    name: 'Paula Regina Lima',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    email: 'paula.lima@email.com',
    phone: '(11) 99999-0005',
    lastConsultation: '2023-12-20',
    totalConsultations: 4,
    status: 'inactive',
    condition: 'Dor crônica',
    age: 39,
  },
  {
    id: '6',
    name: 'Roberto Almeida Costa',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'roberto.costa@email.com',
    phone: '(11) 99999-0006',
    lastConsultation: '2024-01-12',
    totalConsultations: 6,
    status: 'active',
    condition: 'Parkinson',
    age: 67,
  },
];

const conditionColors: Record<string, string> = {
  'Dor crônica': 'bg-amber-100 text-amber-800',
  'Ansiedade': 'bg-blue-100 text-blue-800',
  'Epilepsia': 'bg-purple-100 text-purple-800',
  'Insônia': 'bg-indigo-100 text-indigo-800',
  'Parkinson': 'bg-emerald-100 text-emerald-800',
};

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase()) ||
      patient.condition.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">Meus Pacientes</h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerencie e acompanhe todos os seus pacientes em um só lugar.
            </p>
          </div>
          <Link
            href="/patients/new"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Novo Paciente</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background-light p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">group</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{patients.length}</p>
                  <p className="text-sm text-slate-500">Total de Pacientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {patients.filter((p) => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-slate-500">Pacientes Ativos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">schedule</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">12</p>
                  <p className="text-sm text-slate-500">Consultas Hoje</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">medication</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">28</p>
                  <p className="text-sm text-slate-500">Prescrições Ativas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou condição..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'active'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'inactive'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Inativos
                </button>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Condição
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Última Consulta
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Consultas
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-full bg-cover bg-center ring-2 ring-white shadow-sm"
                          style={{ backgroundImage: `url(${patient.avatar})` }}
                        />
                        <div>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500">{patient.age} anos</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{patient.phone}</p>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conditionColors[patient.condition] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(patient.lastConsultation).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center size-8 rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                        {patient.totalConsultations}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          patient.status === 'active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            patient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        ></span>
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-primary"
                          title="Ver prontuário"
                        >
                          <span className="material-symbols-outlined text-xl">folder_open</span>
                        </Link>
                        <Link
                          href={`/prescriptions/new?patient=${patient.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-primary"
                          title="Nova prescrição"
                        >
                          <span className="material-symbols-outlined text-xl">medication</span>
                        </Link>
                        <Link
                          href={`/consultation/${patient.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-primary"
                          title="Iniciar consulta"
                        >
                          <span className="material-symbols-outlined text-xl">videocam</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                  search_off
                </span>
                <p className="text-slate-500">Nenhum paciente encontrado</p>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando {filteredPatients.length} de {patients.length} pacientes
              </p>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                  Anterior
                </button>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                  Próxima
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
