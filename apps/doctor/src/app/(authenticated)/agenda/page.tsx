'use client';

import { useState } from 'react';
import Link from 'next/link';

// Brazilian patient names with Unsplash avatars
const patients = [
  { name: 'Maria Silva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { name: 'João Santos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { name: 'Ana Oliveira', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { name: 'Carlos Ferreira', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
  { name: 'Fernanda Costa', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
  { name: 'Paulo Lima', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  { name: 'Juliana Souza', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
  { name: 'Roberto Alves', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
];

const consultationTypes = ['Primeira consulta', 'Retorno', 'Renovação'];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface Slot {
  time: string;
  status: 'available' | 'booked' | 'blocked';
  patient?: typeof patients[0];
  type?: string;
}

// Generate mock slots for a day
const generateDaySlots = (dayIndex: number): Slot[] => {
  if (dayIndex === 6) return []; // Sunday - no slots

  return timeSlots.map((time, i) => {
    const seed = dayIndex * 100 + i;
    const rand = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);

    if (rand < 0.25) {
      return { time, status: 'available' };
    } else if (rand < 0.7) {
      return {
        time,
        status: 'booked',
        patient: patients[(seed) % patients.length],
        type: consultationTypes[(seed) % consultationTypes.length],
      };
    } else if (rand < 0.85) {
      return { time, status: 'blocked' };
    }
    return { time, status: 'available' };
  });
};

export default function AgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  const [filter, setFilter] = useState<'all' | 'booked' | 'available'>('all');
  const [showBlockModal, setShowBlockModal] = useState(false);

  const getWeekDates = () => {
    return weekDays.map((_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Generate slots for all days
  const weekSlots = weekDays.map((_, i) => generateDaySlots(i));

  // Count stats
  const allSlots = weekSlots.flat();
  const bookedCount = allSlots.filter(s => s.status === 'booked').length;
  const availableCount = allSlots.filter(s => s.status === 'available').length;
  const blockedCount = allSlots.filter(s => s.status === 'blocked').length;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie seus horários e consultas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            Bloquear Horário
          </button>
          <Link
            href="/consultations"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Agendamento
          </Link>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">event</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Agendados</p>
              <p className="text-xl font-bold text-slate-900">{bookedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Disponíveis</p>
              <p className="text-xl font-bold text-slate-900">{availableCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-slate-500">block</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Bloqueados</p>
              <p className="text-xl font-bold text-slate-900">{blockedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <span className="ml-2 text-lg font-semibold text-slate-900">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('booked')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'booked' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Agendados
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'available' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Disponíveis
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-3 text-center bg-slate-50 border-r border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase">Horário</span>
          </div>
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                isToday(weekDates[i]) ? 'bg-primary/5' : 'bg-slate-50'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 uppercase">{day}</span>
              <p className={`text-lg font-bold ${isToday(weekDates[i]) ? 'text-primary' : 'text-slate-900'}`}>
                {weekDates[i].getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">
              <div className="p-2 text-center border-r border-slate-100 bg-slate-50/50">
                <span className="text-sm font-medium text-slate-600">{time}</span>
              </div>
              {weekDays.map((_, dayIndex) => {
                const daySlots = weekSlots[dayIndex];
                const slot = daySlots.find(s => s.time === time);

                if (!slot) {
                  return (
                    <div key={dayIndex} className="p-1 border-r border-slate-100 last:border-r-0 bg-slate-50/30">
                      <div className="h-full min-h-[60px]" />
                    </div>
                  );
                }

                if (filter !== 'all' && slot.status !== filter) {
                  return (
                    <div key={dayIndex} className="p-1 border-r border-slate-100 last:border-r-0">
                      <div className="h-full min-h-[60px]" />
                    </div>
                  );
                }

                return (
                  <div key={dayIndex} className="p-1 border-r border-slate-100 last:border-r-0">
                    <div
                      className={`h-full min-h-[60px] rounded-lg p-2 text-xs cursor-pointer transition-all hover:shadow-md ${
                        slot.status === 'available'
                          ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                          : slot.status === 'booked'
                            ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {slot.status === 'available' && (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span className="font-medium">Disponível</span>
                        </div>
                      )}
                      {slot.status === 'booked' && slot.patient && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <img
                              src={slot.patient.avatar}
                              alt={slot.patient.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-medium text-slate-900 truncate">{slot.patient.name.split(' ')[0]}</span>
                          </div>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${
                            slot.type === 'Primeira consulta'
                              ? 'bg-purple-100 text-purple-700'
                              : slot.type === 'Retorno'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}>
                            {slot.type}
                          </span>
                        </div>
                      )}
                      {slot.status === 'blocked' && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">block</span>
                          <span className="font-medium">Bloqueado</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400" />
          <span>Bloqueado</span>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Bloquear Horário</h2>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo (opcional)</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option>Férias</option>
                  <option>Congresso/Evento</option>
                  <option>Indisponibilidade pessoal</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm"
              >
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
