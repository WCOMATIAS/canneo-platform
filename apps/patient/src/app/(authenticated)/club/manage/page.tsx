'use client';

import { useState } from 'react';
import Link from 'next/link';

const currentPlan = {
  name: 'Premium',
  price: 49.9,
  status: 'active',
  nextBilling: '15 Fev, 2026',
  startDate: '15 Jan, 2026',
  paymentMethod: 'Visa **** 4242',
};

const benefits = [
  '20% de desconto em medicamentos',
  'Frete grátis em todos os pedidos',
  '15% OFF em consultas',
  'Renovação automática de receitas',
  'Suporte prioritário 24h',
  'Pontos em dobro',
];

const paymentHistory = [
  { id: 1, date: '15 Jan, 2026', amount: 49.9, status: 'paid', method: 'Visa **** 4242' },
  { id: 2, date: '15 Dez, 2025', amount: 49.9, status: 'paid', method: 'Visa **** 4242' },
  { id: 3, date: '15 Nov, 2025', amount: 49.9, status: 'paid', method: 'Visa **** 4242' },
];

export default function ClubManagePage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/club"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar para Clube de Saúde
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Gerenciar Assinatura</h1>
        <p className="text-slate-500 mt-1">Visualize e gerencie sua assinatura do Clube de Saúde.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-primary to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold uppercase backdrop-blur-sm">
                Plano Ativo
              </span>
            </div>
            <h2 className="text-3xl font-black">{currentPlan.name}</h2>
            <p className="text-white/80 mt-1">Membro desde {currentPlan.startDate}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Próxima cobrança</p>
            <p className="text-2xl font-bold">{currentPlan.nextBilling}</p>
            <p className="text-white/80">R$ {currentPlan.price.toFixed(2).replace('.', ',')}/mês</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benefits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Benefícios do seu Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  <span className="text-sm text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">Histórico de Pagamentos</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Método</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      R$ {payment.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.method}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">check</span>
                        Pago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Ações da Assinatura</h3>
            <div className="space-y-3">
              <Link
                href="/club"
                className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">upgrade</span>
                  <span className="font-medium text-slate-900">Alterar Plano</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </Link>

              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">credit_card</span>
                  <span className="font-medium text-slate-900">Alterar Pagamento</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-600">pause</span>
                  <span className="font-medium text-orange-700">Pausar Assinatura</span>
                </div>
                <span className="material-symbols-outlined text-orange-400">chevron_right</span>
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600">cancel</span>
                  <span className="font-medium text-red-700">Cancelar Assinatura</span>
                </div>
                <span className="material-symbols-outlined text-red-400">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Forma de Pagamento</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-slate-600">credit_card</span>
              <div>
                <p className="font-medium text-slate-900">{currentPlan.paymentMethod}</p>
                <p className="text-xs text-slate-500">Atualizado em Jan, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-red-600">sentiment_sad</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tem certeza que deseja cancelar?</h3>
              <p className="text-slate-500">
                Você perderá todos os benefícios do Clube de Saúde ao final do período pago.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Por que está cancelando? (opcional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="">Selecione um motivo</option>
                <option value="price">Preço muito alto</option>
                <option value="not-using">Não estou usando os benefícios</option>
                <option value="found-better">Encontrei opção melhor</option>
                <option value="treatment-ended">Meu tratamento terminou</option>
                <option value="other">Outro motivo</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                Confirmar Cancelamento
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Você continuará tendo acesso até {currentPlan.nextBilling}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
