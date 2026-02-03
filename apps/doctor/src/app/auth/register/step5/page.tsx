'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterProgressBar from '@/components/RegisterProgressBar';

const steps = ['Pessoal', 'Endereço', 'Profissional', 'Documentos', 'Agenda', 'Honorários', 'Revisão'];

const weekDays = [
  { id: 'monday', label: 'Segunda', short: 'Seg' },
  { id: 'tuesday', label: 'Terça', short: 'Ter' },
  { id: 'wednesday', label: 'Quarta', short: 'Qua' },
  { id: 'thursday', label: 'Quinta', short: 'Qui' },
  { id: 'friday', label: 'Sexta', short: 'Sex' },
  { id: 'saturday', label: 'Sábado', short: 'Sáb' },
  { id: 'sunday', label: 'Domingo', short: 'Dom' },
];

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

const durationOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
];

const intervalOptions = [
  { value: 0, label: 'Sem intervalo' },
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  interval: number;
}

type ScheduleState = {
  [key: string]: DaySchedule;
};

const initialSchedule: ScheduleState = weekDays.reduce((acc, day) => {
  acc[day.id] = {
    enabled: day.id !== 'saturday' && day.id !== 'sunday',
    startTime: '08:00',
    endTime: '18:00',
    interval: 10,
  };
  return acc;
}, {} as ScheduleState);

export default function RegisterStep5Page() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleState>(initialSchedule);
  const [consultationDuration, setConsultationDuration] = useState(30);

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], enabled: !prev[dayId].enabled },
    }));
  };

  const updateDaySchedule = (dayId: string, field: keyof DaySchedule, value: string | number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('registerStep5', JSON.stringify({ schedule, consultationDuration }));
    router.push('/auth/register/step6');
  };

  const enabledDays = weekDays.filter((day) => schedule[day.id].enabled);

  // Calculate slots per day for preview
  const calculateSlots = (dayId: string) => {
    const day = schedule[dayId];
    if (!day.enabled) return 0;
    const start = parseInt(day.startTime.split(':')[0]) * 60 + parseInt(day.startTime.split(':')[1]);
    const end = parseInt(day.endTime.split(':')[0]) * 60 + parseInt(day.endTime.split(':')[1]);
    const slotTime = consultationDuration + day.interval;
    return Math.floor((end - start) / slotTime);
  };

  const totalWeeklySlots = weekDays.reduce((acc, day) => acc + calculateSlots(day.id), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configure sua Agenda</h1>
        <p className="text-slate-500 mt-2">Defina seus horários de atendimento</p>
      </div>

      {/* Progress Bar */}
      <RegisterProgressBar currentStep={5} steps={steps} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultation Duration */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Duração Padrão da Consulta <span className="text-red-500">*</span>
          </label>
          <select
            value={consultationDuration}
            onChange={(e) => setConsultationDuration(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Days Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Dias de Atendimento <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  schedule[day.id].enabled
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Details for Each Enabled Day */}
        {enabledDays.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Horários por Dia
            </label>
            {enabledDays.map((day) => (
              <div
                key={day.id}
                className="p-4 bg-white rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{day.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remover
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Início</label>
                    <select
                      value={schedule[day.id].startTime}
                      onChange={(e) => updateDaySchedule(day.id, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Fim</label>
                    <select
                      value={schedule[day.id].endTime}
                      onChange={(e) => updateDaySchedule(day.id, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Intervalo</label>
                    <select
                      value={schedule[day.id].interval}
                      onChange={(e) => updateDaySchedule(day.id, 'interval', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {intervalOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Preview */}
        <div className="p-4 bg-slate-100 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <span className="font-semibold text-slate-900">Preview da Agenda Semanal</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const slots = calculateSlots(day.id);
              return (
                <div
                  key={day.id}
                  className={`p-2 rounded-lg text-center ${
                    schedule[day.id].enabled ? 'bg-white' : 'bg-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-600">{day.short}</span>
                  <p
                    className={`text-lg font-bold ${
                      schedule[day.id].enabled ? 'text-primary' : 'text-slate-400'
                    }`}
                  >
                    {slots}
                  </p>
                  <span className="text-xs text-slate-400">vagas</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">Total semanal:</span>
            <span className="text-lg font-bold text-primary">{totalWeeklySlots} consultas</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
          <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Dica</p>
            <p className="text-sm text-blue-700">
              Você poderá ajustar sua agenda a qualquer momento após completar o cadastro.
              Bloqueie horários específicos quando necessário.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Link
            href="/auth/register/step4"
            className="flex-1 py-4 border border-slate-300 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </Link>
          <button
            type="submit"
            disabled={enabledDays.length === 0}
            className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
