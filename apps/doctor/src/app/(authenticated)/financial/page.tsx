'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockTransactions = [
  {
    id: '1',
    date: '2024-01-30',
    description: 'Consulta com Maria Silva',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'available',
  },
  {
    id: '2',
    date: '2024-01-29',
    description: 'Consulta com João Santos',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'available',
  },
  {
    id: '3',
    date: '2024-01-28',
    description: 'Consulta com Ana Oliveira',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'pending',
  },
  {
    id: '4',
    date: '2024-01-27',
    description: 'Consulta com Carlos Ferreira',
    grossValue: 280,
    fee: 42,
    netValue: 238,
    status: 'pending',
  },
  {
    id: '5',
    date: '2024-01-26',
    description: 'Consulta com Fernanda Costa',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'withdrawn',
  },
  {
    id: '6',
    date: '2024-01-25',
    description: 'Consulta com Paulo Lima',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'withdrawn',
  },
  {
    id: '7',
    date: '2024-01-24',
    description: 'Consulta com Juliana Souza',
    grossValue: 280,
    fee: 42,
    netValue: 238,
    status: 'withdrawn',
  },
  {
    id: '8',
    date: '2024-01-23',
    description: 'Consulta com Roberto Alves',
    grossValue: 350,
    fee: 52.5,
    netValue: 297.5,
    status: 'withdrawn',
  },
];

const statusConfig = {
  available: { label: 'Disponível', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  withdrawn: { label: 'Sacado', color: 'bg-slate-100 text-slate-700' },
};

const monthlyData = [
  { month: 'Ago', value: 8500 },
  { month: 'Set', value: 12200 },
  { month: 'Out', value: 10800 },
  { month: 'Nov', value: 14500 },
  { month: 'Dez', value: 11200 },
  { month: 'Jan', value: 9800 },
];

export default function FinancialPage() {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'month'>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Calculate stats
  const availableBalance = mockTransactions
    .filter((t) => t.status === 'available')
    .reduce((acc, t) => acc + t.netValue, 0);

  const pendingBalance = mockTransactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + t.netValue, 0);

  const thisMonthTotal = mockTransactions
    .filter((t) => {
      const date = new Date(t.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((acc, t) => acc + t.netValue, 0);

  const totalReceived = mockTransactions.reduce((acc, t) => acc + t.netValue, 0);

  const maxChartValue = Math.max(...monthlyData.map((d) => d.value));

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhe seus ganhos e transações</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Solicitar Saque
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 shadow-lg text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <p className="text-emerald-100 text-sm mb-1">Saldo Disponível</p>
          <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">schedule</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Saldo Pendente</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(pendingBalance)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
            </div>
            <span className="text-xs font-medium text-emerald-500">+12%</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Este Mês</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(thisMonthTotal)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <span className="material-symbols-outlined text-purple-600">trending_up</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Total Recebido</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceived)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Faturamento Mensal</h2>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
        </div>
        <div className="flex items-end justify-between gap-4 h-48">
          {monthlyData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                style={{ height: `${(data.value / maxChartValue) * 100}%` }}
              >
                <div
                  className="w-full bg-primary rounded-t-lg"
                  style={{ height: `${(data.value / maxChartValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
          <span className="text-slate-500">Média mensal: <strong className="text-slate-900">{formatCurrency(monthlyData.reduce((a, b) => a + b.value, 0) / monthlyData.length)}</strong></span>
          <span className="text-slate-500">Total período: <strong className="text-slate-900">{formatCurrency(monthlyData.reduce((a, b) => a + b.value, 0))}</strong></span>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Transações</h2>
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'week', label: 'Esta semana' },
              { key: 'month', label: 'Este mês' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setPeriodFilter(f.key as typeof periodFilter)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                  periodFilter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Data</th>
              <th className="px-6 py-3 text-left font-semibold">Descrição</th>
              <th className="px-6 py-3 text-right font-semibold">Valor Bruto</th>
              <th className="px-6 py-3 text-right font-semibold">Taxa (15%)</th>
              <th className="px-6 py-3 text-right font-semibold">Valor Líquido</th>
              <th className="px-6 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">{transaction.description}</td>
                <td className="px-6 py-4 text-sm text-slate-900 text-right">
                  {formatCurrency(transaction.grossValue)}
                </td>
                <td className="px-6 py-4 text-sm text-red-500 text-right">
                  -{formatCurrency(transaction.fee)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                  {formatCurrency(transaction.netValue)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      statusConfig[transaction.status as keyof typeof statusConfig]?.color
                    }`}
                  >
                    {statusConfig[transaction.status as keyof typeof statusConfig]?.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Solicitar Saque</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-700">Saldo disponível para saque</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(availableBalance)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Valor do saque</label>
                <input
                  type="text"
                  defaultValue={formatCurrency(availableBalance)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-lg font-semibold"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-2">Conta de destino</p>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">account_balance</span>
                  <div>
                    <p className="font-semibold text-slate-900">Banco Inter</p>
                    <p className="text-sm text-slate-500">Ag: 0001 • Conta: ****4242</p>
                  </div>
                </div>
              </div>
              <Link
                href="/bank-accounts"
                className="text-sm text-primary hover:underline"
              >
                Alterar conta bancária
              </Link>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm"
              >
                Confirmar Saque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
