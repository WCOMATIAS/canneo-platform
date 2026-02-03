'use client';

import { useState } from 'react';
import Link from 'next/link';

const appointments = [
  {
    id: '1',
    date: '31 Jan, 2026',
    time: '14:00',
    doctor: {
      name: 'Dra. Ana Beatriz Santos',
      specialty: 'Neurologista',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    },
    status: 'upcoming',
    type: 'Telemedicina',
    canEnter: true,
  },
  {
    id: '2',
    date: '05 Fev, 2026',
    time: '10:00',
    doctor: {
      name: 'Dr. Carlos Eduardo Lima',
      specialty: 'Psiquiatra',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    },
    status: 'upcoming',
    type: 'Telemedicina',
    canEnter: false,
  },
  {
    id: '3',
    date: '20 Jan, 2026',
    time: '09:00',
    doctor: {
      name: 'Dra. Fernanda Costa',
      specialty: 'Clínica Geral',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=face',
    },
    status: 'completed',
    type: 'Telemedicina',
    canEnter: false,
  },
  {
    id: '4',
    date: '10 Jan, 2026',
    time: '15:00',
    doctor: {
      name: 'Dr. Roberto Almeida',
      specialty: 'Neurologista',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    },
    status: 'completed',
    type: 'Telemedicina',
    canEnter: false,
  },
  {
    id: '5',
    date: '05 Jan, 2026',
    time: '11:00',
    doctor: {
      name: 'Dra. Maria Helena',
      specialty: 'Psiquiatra',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    },
    status: 'cancelled',
    type: 'Telemedicina',
    canEnter: false,
  },
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const filteredAppointments = appointments.filter((apt) => apt.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Agendada</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Concluída</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Cancelada</span>;
      default:
        return null;
    }
  };

  const getActionButton = (apt: typeof appointments[0]) => {
    switch (apt.status) {
      case 'upcoming':
        return apt.canEnter ? (
          <Link
            href={`/consultation/${apt.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            Entrar
          </Link>
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
            Reagendar
          </button>
        );
      case 'completed':
        return (
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
            Ver Detalhes
          </button>
        );
      case 'cancelled':
        return (
          <Link
            href="/appointments/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Reagendar
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Minhas Consultas</h1>
          <p className="text-slate-500 mt-1">Gerencie e acompanhe suas consultas médicas</p>
        </div>
        <Link
          href="/appointments/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg h-11 px-5 font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Consulta
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Próximas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {appointments.filter((a) => a.status === 'upcoming').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Realizadas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {appointments.filter((a) => a.status === 'completed').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cancelled'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Canceladas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            {appointments.filter((a) => a.status === 'cancelled').length}
          </span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">filter_list</span>
          <span className="text-sm text-slate-500">Filtrar por:</span>
        </div>
        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-primary focus:border-primary">
          <option>Todos os períodos</option>
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Últimos 3 meses</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="flex flex-col gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">calendar_month</span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma consulta encontrada</h3>
            <p className="text-slate-500 text-sm mb-6">
              {activeTab === 'upcoming'
                ? 'Você não tem consultas agendadas no momento.'
                : activeTab === 'completed'
                ? 'Você ainda não realizou nenhuma consulta.'
                : 'Você não tem consultas canceladas.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/appointments/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                Agendar Consulta
              </Link>
            )}
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
            >
              {/* Date/Time */}
              <div className="flex items-center gap-4 md:w-40 shrink-0">
                <div className="flex flex-col items-center justify-center size-14 rounded-xl bg-slate-100">
                  <span className="text-xs text-slate-500 uppercase font-medium">{apt.date.split(' ')[1]}</span>
                  <span className="text-xl font-bold text-slate-900">{apt.date.split(' ')[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{apt.time}</p>
                  <p className="text-xs text-slate-500">{apt.type}</p>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={apt.doctor.avatar}
                  alt={apt.doctor.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{apt.doctor.name}</p>
                  <p className="text-xs text-slate-500">{apt.doctor.specialty}</p>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {getStatusBadge(apt.status)}
                {getActionButton(apt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
