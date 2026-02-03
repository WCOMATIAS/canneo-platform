'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data
const upcomingConsultations = [
  {
    id: '1',
    time: '09:00',
    patientName: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
    type: 'Primeira Consulta',
    typeIcon: 'fiber_new',
    canJoin: true,
  },
  {
    id: '2',
    time: '09:30',
    patientName: 'João Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
    type: 'Renovação de Receita',
    typeIcon: 'refresh',
    canJoin: true,
  },
  {
    id: '3',
    time: '10:00',
    patientName: 'Carlos Ferreira',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face',
    type: 'Retorno',
    typeIcon: 'replay',
    canJoin: false,
  },
];

const recentRecords = [
  {
    id: '1',
    patientName: 'Ana Oliveira',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face',
    recordType: 'Receita PDF',
    date: '24 Out, 2023',
  },
  {
    id: '2',
    patientName: 'Paulo Lima',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face',
    recordType: 'Resultados de Exames',
    date: '23 Out, 2023',
  },
];

// Calendar data
const calendarDays = [
  { day: 29, isCurrentMonth: false },
  { day: 30, isCurrentMonth: false },
  ...Array.from({ length: 26 }, (_, i) => ({ day: i + 1, isCurrentMonth: true })),
];

export default function DashboardPage() {
  const [currentMonth] = useState('Outubro 2023');
  const today = 24;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bom dia, Dr. Silva</h1>
          <p className="text-slate-500 text-sm mt-1">Aqui está o que está acontecendo na sua clínica hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Consulta
          </button>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
            </div>
            <span className="text-xs font-medium text-slate-400">Hoje</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Consultas hoje</p>
          <p className="text-2xl font-bold text-slate-900">8</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">payments</span>
            </div>
            <span className="text-xs font-medium text-emerald-500">↑ 12%</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Saldo disponível</p>
          <p className="text-2xl font-bold text-slate-900">R$ 1.250,00</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">schedule</span>
            </div>
            <span className="text-xs font-medium text-slate-400"></span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Saldo pendente</p>
          <p className="text-2xl font-bold text-slate-900">R$ 450,00</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <span className="material-symbols-outlined text-purple-600">account_balance_wallet</span>
            </div>
            <span className="text-xs font-medium text-emerald-500">↑ 5%</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Total recebido</p>
          <p className="text-2xl font-bold text-slate-900">R$ 45.200,00</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* PROXIMAS CONSULTAS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Próximas Consultas</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">3 Hoje</span>
              </div>
              <Link href="/agenda" className="text-primary hover:text-primary-dark text-sm font-medium">
                Ver Agenda
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-slate-900 w-14">{consultation.time}</span>
                    <img
                      src={consultation.avatar}
                      alt={consultation.patientName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{consultation.patientName}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">{consultation.typeIcon}</span>
                        {consultation.type}
                      </p>
                    </div>
                  </div>
                  {consultation.canJoin ? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm">
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      Entrar na chamada
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      Aguardando
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PRONTUARIOS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Prontuários Atualizados Recentemente</h2>
              <Link href="/patients" className="text-primary hover:text-primary-dark text-sm font-medium">
                Ver Todos
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Paciente</th>
                  <th className="px-6 py-3 text-left font-semibold">Tipo de Registro</th>
                  <th className="px-6 py-3 text-left font-semibold">Data</th>
                  <th className="px-6 py-3 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.avatar}
                          alt={record.patientName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-slate-900">{record.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{record.recordType}</td>
                    <td className="px-6 py-4 text-slate-500">{record.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-primary-dark font-medium text-sm">Baixar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR DIREITA */}
        <div className="flex flex-col gap-6">
          {/* CARD SAQUE */}
          <div className="bg-gradient-to-br from-[#1a2632] to-[#2b3a4a] text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Disponível para Saque</p>
                <h2 className="text-3xl font-bold">R$ 1.250,00</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>Banco Inter **** 4242</span>
                </div>
                <button className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm shadow-md">
                  Solicitar saque
                </button>
              </div>
            </div>
          </div>

          {/* ACOES RAPIDAS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Ações Rápidas</h3>
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Assinar Documentos</span>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <span className="material-symbols-outlined text-[20px]">medication</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Aprovar Receitas</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Mensagens de Pacientes</span>
                </div>
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
              </button>
            </div>
          </div>

          {/* CALENDARIO */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{currentMonth}</h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-100 rounded">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs gap-y-3">
              <span className="text-slate-400 font-medium">Dom</span>
              <span className="text-slate-400 font-medium">Seg</span>
              <span className="text-slate-400 font-medium">Ter</span>
              <span className="text-slate-400 font-medium">Qua</span>
              <span className="text-slate-400 font-medium">Qui</span>
              <span className="text-slate-400 font-medium">Sex</span>
              <span className="text-slate-400 font-medium">Sáb</span>
              {calendarDays.map((item, index) => (
                <span
                  key={index}
                  className={`p-1 rounded ${
                    !item.isCurrentMonth
                      ? 'text-slate-300'
                      : item.day === today
                      ? 'bg-primary text-white font-bold rounded-lg'
                      : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
