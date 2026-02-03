'use client';

import { useState } from 'react';
import Link from 'next/link';

// Brazilian patient names with Unsplash avatars
const mockConsultations = [
  {
    id: '1',
    patient: { name: 'Maria Silva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '09:00',
    type: 'Primeira consulta',
    status: 'scheduled',
  },
  {
    id: '2',
    patient: { name: 'João Santos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '09:30',
    type: 'Retorno',
    status: 'scheduled',
  },
  {
    id: '3',
    patient: { name: 'Ana Oliveira', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '10:00',
    type: 'Renovação',
    status: 'waiting',
  },
  {
    id: '4',
    patient: { name: 'Carlos Ferreira', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '10:30',
    type: 'Retorno',
    status: 'completed',
  },
  {
    id: '5',
    patient: { name: 'Fernanda Costa', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-31',
    time: '08:00',
    type: 'Primeira consulta',
    status: 'scheduled',
  },
  {
    id: '6',
    patient: { name: 'Paulo Lima', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-31',
    time: '09:00',
    type: 'Renovação',
    status: 'scheduled',
  },
  {
    id: '7',
    patient: { name: 'Juliana Souza', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '11:00',
    type: 'Primeira consulta',
    status: 'completed',
  },
  {
    id: '8',
    patient: { name: 'Roberto Alves', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
    date: '2024-01-30',
    time: '14:00',
    type: 'Retorno',
    status: 'waiting',
  },
];

const statusConfig = {
  scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-700' },
  waiting: { label: 'Aguardando', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'Em andamento', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Finalizada', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const typeConfig = {
  'Primeira consulta': { color: 'bg-purple-100 text-purple-700', icon: 'fiber_new' },
  'Retorno': { color: 'bg-blue-100 text-blue-700', icon: 'replay' },
  'Renovação': { color: 'bg-amber-100 text-amber-700', icon: 'refresh' },
};

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'waiting' | 'completed'>('today');
  const [dateFilter, setDateFilter] = useState('');

  const today = '2024-01-30';

  const todayConsultations = mockConsultations.filter(c => c.date === today);
  const upcomingConsultations = mockConsultations.filter(c => c.date > today && c.status === 'scheduled');
  const waitingConsultations = mockConsultations.filter(c => c.status === 'waiting');
  const completedConsultations = mockConsultations.filter(c => c.status === 'completed');

  const getFilteredConsultations = () => {
    switch (activeTab) {
      case 'today':
        return todayConsultations;
      case 'upcoming':
        return upcomingConsultations;
      case 'waiting':
        return waitingConsultations;
      case 'completed':
        return completedConsultations;
      default:
        return todayConsultations;
    }
  };

  const filteredConsultations = getFilteredConsultations();

  // Find next consultation
  const nextConsultation = todayConsultations.find(c => c.status === 'scheduled' || c.status === 'waiting');

  // Stats
  const totalToday = todayConsultations.length;
  const completedToday = todayConsultations.filter(c => c.status === 'completed').length;
  const pendingToday = todayConsultations.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Consultas</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie suas consultas e atendimentos</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Link
            href="/prescriptions/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Consulta
          </Link>
        </div>
      </header>

      {/* Next Consultation Card */}
      {nextConsultation && (
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="material-symbols-outlined text-3xl">schedule</span>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Próxima consulta</p>
                <h2 className="text-2xl font-bold">{nextConsultation.time} - {nextConsultation.patient.name}</h2>
                <p className="text-white/80 text-sm">{nextConsultation.type}</p>
              </div>
            </div>
            <Link
              href={`/consultation/${nextConsultation.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Iniciar Consulta
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Hoje</p>
              <p className="text-2xl font-bold text-slate-900">{totalToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Realizadas</p>
              <p className="text-2xl font-bold text-slate-900">{completedToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">pending</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Pendentes</p>
              <p className="text-2xl font-bold text-slate-900">{pendingToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {[
            { key: 'today', label: 'Hoje', count: todayConsultations.length },
            { key: 'upcoming', label: 'Próximas', count: upcomingConsultations.length },
            { key: 'waiting', label: 'Aguardando', count: waitingConsultations.length },
            { key: 'completed', label: 'Finalizadas', count: completedConsultations.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">event_busy</span>
            <p className="text-slate-500 mt-4">Nenhuma consulta encontrada</p>
          </div>
        ) : (
          filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-xl font-bold text-slate-900">{consultation.time}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(consultation.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
                <img
                  src={consultation.patient.avatar}
                  alt={consultation.patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">{consultation.patient.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig[consultation.type as keyof typeof typeConfig]?.color}`}>
                      <span className="material-symbols-outlined text-[12px]">
                        {typeConfig[consultation.type as keyof typeof typeConfig]?.icon}
                      </span>
                      {consultation.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[consultation.status as keyof typeof statusConfig]?.color}`}>
                  {statusConfig[consultation.status as keyof typeof statusConfig]?.label}
                </span>
                {(consultation.status === 'scheduled' || consultation.status === 'waiting') && consultation.date === today && (
                  <Link
                    href={`/consultation/${consultation.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">videocam</span>
                    Iniciar
                  </Link>
                )}
                <Link
                  href={`/patients/${consultation.id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Detalhes
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
