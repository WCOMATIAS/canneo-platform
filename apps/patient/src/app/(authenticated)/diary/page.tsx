'use client';

import { useState } from 'react';

const weekDays = [
  { day: 'DOM', date: 26, hasEntry: true },
  { day: 'SEG', date: 27, hasEntry: true },
  { day: 'TER', date: 28, hasEntry: false },
  { day: 'QUA', date: 29, hasEntry: true },
  { day: 'QUI', date: 30, hasEntry: true },
  { day: 'SEX', date: 31, hasEntry: false, isToday: true },
  { day: 'SÁB', date: 1, hasEntry: false },
];

const entries = [
  {
    id: 1,
    date: '30 Jan, 2026',
    time: '08:30',
    medication: 'Óleo CBD Full Spectrum 3000mg',
    dosage: '0,5ml (10 gotas)',
    mood: '🙂',
    moodLabel: 'Bem',
    painLevel: 3,
    symptoms: ['Leve ansiedade', 'Dor lombar'],
    notes: 'Acordei com leve dor nas costas, melhorou após tomar o medicamento.',
  },
  {
    id: 2,
    date: '29 Jan, 2026',
    time: '21:00',
    medication: 'Óleo CBD + CBN Sleep 2000mg',
    dosage: '0,3ml (6 gotas)',
    mood: '😴',
    moodLabel: 'Sonolento',
    painLevel: 2,
    symptoms: ['Insônia'],
    notes: 'Dormi bem após usar o medicamento.',
  },
  {
    id: 3,
    date: '29 Jan, 2026',
    time: '08:15',
    medication: 'Óleo CBD Full Spectrum 3000mg',
    dosage: '0,5ml (10 gotas)',
    mood: '😐',
    moodLabel: 'Regular',
    painLevel: 5,
    symptoms: ['Enxaqueca', 'Náusea'],
    notes: 'Acordei com enxaqueca forte. Medicamento ajudou parcialmente.',
  },
];

const medications = [
  'Óleo CBD Full Spectrum 3000mg',
  'Óleo CBD + CBN Sleep 2000mg',
  'Creme Tópico CBD 500mg',
];

export default function DiaryPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(31);
  const [newEntry, setNewEntry] = useState({
    medication: '',
    dosage: '',
    time: '',
    mood: '',
    painLevel: 5,
    symptoms: '',
    notes: '',
  });

  const moods = [
    { emoji: '😫', label: 'Péssimo', color: 'red' },
    { emoji: '😕', label: 'Ruim', color: 'orange' },
    { emoji: '😐', label: 'Regular', color: 'yellow' },
    { emoji: '🙂', label: 'Bem', color: 'blue' },
    { emoji: '😁', label: 'Ótimo', color: 'green' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Diário de Tratamento</h1>
          <p className="text-slate-500 mt-1">Registre seu progresso diário para otimizar seu tratamento.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Registro
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(day.date)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  day.isToday
                    ? 'bg-primary text-white shadow-md scale-105'
                    : day.date === selectedDay
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`text-xs font-medium ${day.isToday ? 'text-white/80' : ''}`}>{day.day}</span>
                <span className={`text-lg font-bold ${day.isToday ? '' : ''}`}>{day.date}</span>
                {day.hasEntry && !day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1"></span>
                )}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Entries */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Registros Recentes</h2>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{entry.mood}</div>
                  <div>
                    <p className="font-bold text-slate-900">{entry.moodLabel}</p>
                    <p className="text-sm text-slate-500">{entry.date} às {entry.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    Dor: {entry.painLevel}/10
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">medication</span>
                  <span className="font-medium text-slate-900">{entry.medication}</span>
                  <span className="text-sm text-slate-500">• {entry.dosage}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {entry.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>

              {entry.notes && (
                <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                  "{entry.notes}"
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {/* Pain Evolution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_down</span>
              Nível de Dor
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Média da semana</span>
                <span className="text-2xl font-black text-primary">3.2</span>
              </div>
              <div className="h-24 bg-slate-50 rounded-lg flex items-end justify-around p-2">
                {[4, 5, 3, 2, 3, 0, 0].map((value, i) => (
                  <div
                    key={i}
                    className={`w-6 rounded-t transition-all ${value > 0 ? 'bg-primary' : 'bg-slate-200'}`}
                    style={{ height: `${value * 15}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>
            </div>
          </div>

          {/* Usage Frequency */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Frequência de Uso
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">Esta semana</span>
                <span className="font-bold text-slate-900">8 doses</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">Última semana</span>
                <span className="font-bold text-slate-900">12 doses</span>
              </div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">trending_down</span>
                33% menos que a semana anterior
              </div>
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bedtime</span>
              Qualidade do Sono
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl">😴</div>
              <div>
                <p className="text-2xl font-black text-slate-900">7.5h</p>
                <p className="text-sm text-slate-500">Média por noite</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4].map((star) => (
                <span key={star} className="material-symbols-outlined text-yellow-400 text-lg filled">star</span>
              ))}
              <span className="material-symbols-outlined text-slate-300 text-lg">star</span>
              <span className="ml-2 text-sm text-slate-500">Qualidade boa</span>
            </div>
          </div>

          {/* Export */}
          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            <span className="material-symbols-outlined">download</span>
            Exportar Relatório para Médico
          </button>
        </div>
      </div>

      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Novo Registro</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Mood */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Como você está se sentindo?</label>
                <div className="flex justify-between">
                  {moods.map((mood) => (
                    <button
                      key={mood.emoji}
                      onClick={() => setNewEntry({ ...newEntry, mood: mood.emoji })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                        newEntry.mood === mood.emoji
                          ? 'bg-primary/10 border-2 border-primary scale-110'
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-xs font-medium text-slate-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Medication */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Medicamento</label>
                <select
                  value={newEntry.medication}
                  onChange={(e) => setNewEntry({ ...newEntry, medication: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione o medicamento</option>
                  {medications.map((med) => (
                    <option key={med} value={med}>{med}</option>
                  ))}
                </select>
              </div>

              {/* Dosage and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dosagem</label>
                  <input
                    type="text"
                    placeholder="Ex: 10 gotas"
                    value={newEntry.dosage}
                    onChange={(e) => setNewEntry({ ...newEntry, dosage: e.target.value })}
                    className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Horário</label>
                  <input
                    type="time"
                    value={newEntry.time}
                    onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                    className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Pain Level */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nível de Dor: <span className="text-primary">{newEntry.painLevel}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newEntry.painLevel}
                  onChange={(e) => setNewEntry({ ...newEntry, painLevel: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Sem dor</span>
                  <span>Dor intensa</span>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sintomas / Efeitos</label>
                <input
                  type="text"
                  placeholder="Ex: Ansiedade, Dor de cabeça"
                  value={newEntry.symptoms}
                  onChange={(e) => setNewEntry({ ...newEntry, symptoms: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea
                  rows={3}
                  placeholder="Como você se sentiu após tomar o medicamento?"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
