'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockPrescriptions = [
  {
    id: '1',
    date: '2024-01-30',
    patient: { name: 'Maria Silva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    medication: 'Óleo CBD 3000mg',
    dosage: '0,5ml 2x ao dia',
    status: 'dispensed',
  },
  {
    id: '2',
    date: '2024-01-29',
    patient: { name: 'João Santos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    medication: 'Óleo Full Spectrum 1500mg',
    dosage: '1ml 1x ao dia',
    status: 'sent',
  },
  {
    id: '3',
    date: '2024-01-28',
    patient: { name: 'Ana Oliveira', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    medication: 'Cápsulas CBD 25mg',
    dosage: '1 cápsula 3x ao dia',
    status: 'issued',
  },
  {
    id: '4',
    date: '2024-01-27',
    patient: { name: 'Carlos Ferreira', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    medication: 'Óleo CBD:THC 20:1',
    dosage: '0,25ml antes de dormir',
    status: 'dispensed',
  },
  {
    id: '5',
    date: '2024-01-26',
    patient: { name: 'Fernanda Costa', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    medication: 'Spray Sublingual CBD',
    dosage: '2 borrifadas 2x ao dia',
    status: 'dispensed',
  },
  {
    id: '6',
    date: '2024-01-25',
    patient: { name: 'Paulo Lima', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    medication: 'Óleo CBD 1000mg',
    dosage: '0,5ml 1x ao dia',
    status: 'sent',
  },
  {
    id: '7',
    date: '2024-01-24',
    patient: { name: 'Juliana Souza', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    medication: 'Creme Tópico CBD',
    dosage: 'Aplicar na área afetada',
    status: 'dispensed',
  },
  {
    id: '8',
    date: '2024-01-23',
    patient: { name: 'Roberto Alves', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
    medication: 'Óleo CBD 3000mg',
    dosage: '1ml 2x ao dia',
    status: 'issued',
  },
];

const statusConfig = {
  issued: { label: 'Emitida', color: 'bg-blue-100 text-blue-700', icon: 'description' },
  sent: { label: 'Enviada', color: 'bg-amber-100 text-amber-700', icon: 'send' },
  dispensed: { label: 'Dispensada', color: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
};

const topMedications = [
  { name: 'Óleo CBD 3000mg', count: 45 },
  { name: 'Óleo Full Spectrum 1500mg', count: 32 },
  { name: 'Cápsulas CBD 25mg', count: 28 },
  { name: 'Óleo CBD:THC 20:1', count: 19 },
];

export default function PrescriptionsPage() {
  const [filter, setFilter] = useState<'all' | 'month' | '3months'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPrescriptions = mockPrescriptions.filter((p) => {
    const matchesSearch =
      p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medication.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;

    const prescriptionDate = new Date(p.date);
    const now = new Date();
    const monthsAgo = filter === 'month' ? 1 : 3;
    const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsAgo));

    return matchesSearch && prescriptionDate >= cutoffDate;
  });

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalPrescriptions = mockPrescriptions.length;
  const thisMonthPrescriptions = mockPrescriptions.filter((p) => {
    const date = new Date(p.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Prescrições</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie suas prescrições médicas</p>
        </div>
        <Link
          href="/prescriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Prescrição
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">description</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Emitidas</p>
              <p className="text-2xl font-bold text-slate-900">{totalPrescriptions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">calendar_month</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Este Mês</p>
              <p className="text-2xl font-bold text-slate-900">{thisMonthPrescriptions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Mais Prescritos</h3>
          <div className="space-y-2">
            {topMedications.slice(0, 2).map((med, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 truncate">{med.name}</span>
                <span className="font-semibold text-slate-900">{med.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por paciente ou medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'month', label: 'Este mês' },
              { key: '3months', label: 'Últimos 3 meses' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Data</th>
              <th className="px-6 py-4 text-left font-semibold">Paciente</th>
              <th className="px-6 py-4 text-left font-semibold">Medicamento</th>
              <th className="px-6 py-4 text-left font-semibold">Dosagem</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPrescriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300">
                    description
                  </span>
                  <p className="text-slate-500 mt-4">Nenhuma prescrição encontrada</p>
                </td>
              </tr>
            ) : (
              paginatedPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">
                      {new Date(prescription.date).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prescription.patient.avatar}
                        alt={prescription.patient.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-900">{prescription.patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{prescription.medication}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{prescription.dosage}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        statusConfig[prescription.status as keyof typeof statusConfig]?.color
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {statusConfig[prescription.status as keyof typeof statusConfig]?.icon}
                      </span>
                      {statusConfig[prescription.status as keyof typeof statusConfig]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredPrescriptions.length)} de{' '}
              {filteredPrescriptions.length} prescrições
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
