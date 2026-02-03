'use client';

import { useState } from 'react';

const appointments = [
  {
    id: '1',
    date: '12/10/2023',
    time: '09:30',
    patientName: 'Maria Silva',
    cpf: '123.456.789-00',
    type: 'Primeira Vez',
    status: 'Finalizada',
    statusColor: 'success',
    value: 'R$ 350,00',
    valueColor: 'text-emerald-600',
    hasRecords: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '2',
    date: '12/10/2023',
    time: '10:15',
    patientName: 'João Santos',
    cpf: '987.654.321-11',
    type: 'Retorno',
    status: 'Cancelada',
    statusColor: 'danger',
    value: 'R$ 0,00',
    valueColor: 'text-slate-400',
    hasRecords: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '3',
    date: '12/10/2023',
    time: '11:00',
    patientName: 'Ana Costa',
    cpf: '456.123.789-22',
    type: 'Primeira Vez',
    status: 'Não Compareceu',
    statusColor: 'warning',
    value: 'R$ 175,00',
    valueColor: 'text-slate-400',
    hasRecords: false,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '4',
    date: '11/10/2023',
    time: '16:45',
    patientName: 'Pedro Oliveira',
    cpf: '111.222.333-44',
    type: 'Retorno',
    status: 'Finalizada',
    statusColor: 'success',
    value: 'R$ 220,00',
    valueColor: 'text-emerald-600',
    hasRecords: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '5',
    date: '11/10/2023',
    time: '14:30',
    patientName: 'Carla Mendes',
    cpf: '555.666.777-88',
    type: 'Teleconsulta',
    status: 'Finalizada',
    statusColor: 'success',
    value: 'R$ 280,00',
    valueColor: 'text-emerald-600',
    hasRecords: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  },
];

const statusStyles = {
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Heading */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
              Histórico de Atendimentos
            </h2>
            <p className="text-slate-500 text-base font-normal">
              Consulte e gerencie o registro completo de seus atendimentos realizados na CANNEO.
            </p>
          </div>
          <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-8 py-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                Paciente / CPF
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Buscar por nome ou CPF..."
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Início
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Fim
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            {/* Type Select */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                Tipo de Atendimento
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
              >
                <option value="">Todos os tipos</option>
                <option value="primeira">Primeira Vez</option>
                <option value="retorno">Retorno</option>
                <option value="teleconsulta">Teleconsulta</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
              >
                <option value="">Todos os status</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="naocompareceu">Não Compareceu</option>
              </select>
            </div>
          </div>

          {/* Chips / Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              Status: Finalizada
              <button className="material-symbols-outlined text-[14px]">close</button>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              Período: Últimos 30 dias
              <button className="material-symbols-outlined text-[14px]">close</button>
            </span>
            <button className="text-xs font-bold text-slate-500 hover:text-primary ml-2 uppercase tracking-tighter">
              Limpar todos os filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-8 py-4 flex-1">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Data / Hora
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Valor Líquido
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{appointment.date}</p>
                    <p className="text-xs text-slate-400">{appointment.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${appointment.avatar})` }}
                      />
                      <p className="text-sm font-bold text-primary">
                        {appointment.patientName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {appointment.cpf}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        statusStyles[appointment.statusColor as keyof typeof statusStyles]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold ${appointment.valueColor}`}>
                    {appointment.value}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {appointment.hasRecords ? (
                        <>
                          <button
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="Ver Prontuário"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              clinical_notes
                            </span>
                          </button>
                          <button
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="Ver Prescrição"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              prescriptions
                            </span>
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-2 opacity-50">
                          <button className="p-2 cursor-not-allowed" disabled>
                            <span className="material-symbols-outlined text-[20px]">
                              clinical_notes
                            </span>
                          </button>
                          <button className="p-2 cursor-not-allowed" disabled>
                            <span className="material-symbols-outlined text-[20px]">
                              prescriptions
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 flex justify-between items-center border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500">
              Mostrando 1-5 de 42 atendimentos
            </p>
            <div className="flex gap-2">
              <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded bg-primary text-white text-xs font-bold">
                1
              </button>
              <button className="px-3 py-1 rounded bg-white border border-slate-200 text-xs hover:bg-slate-50">
                2
              </button>
              <button className="px-3 py-1 rounded bg-white border border-slate-200 text-xs hover:bg-slate-50">
                3
              </button>
              <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Summary Footer */}
      <footer className="mt-auto px-8 py-6 bg-white border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-6 max-w-6xl mx-auto">
          <div className="flex gap-12">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">medical_services</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total de Atendimentos
                </p>
                <p className="text-2xl font-black text-slate-900">42</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-12">
              <div className="size-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Faturamento Líquido Acumulado
                </p>
                <p className="text-2xl font-black text-emerald-600">R$ 12.450,00</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 italic">
              Valores calculados com base nos filtros aplicados acima.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
