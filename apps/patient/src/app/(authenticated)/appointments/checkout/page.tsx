'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/appointments/confirmed');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900">
          Finalizar Agendamento
        </h1>
        <p className="text-slate-500 text-base md:text-lg">
          Revise os detalhes da sua consulta e escolha a melhor forma de pagamento.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Payment */}
        <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Forma de Pagamento</h3>
              <div className="flex gap-2">
                <div className="bg-white p-1 rounded border border-slate-200">
                  <span className="text-xs font-bold text-blue-600">VISA</span>
                </div>
                <div className="bg-white p-1 rounded border border-slate-200">
                  <span className="text-xs font-bold text-red-500">MC</span>
                </div>
                <div className="bg-white p-1 rounded border border-slate-200">
                  <span className="text-xs font-bold text-teal-600">PIX</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'text-primary border-primary bg-slate-50 font-bold'
                    : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                Cartão de Crédito
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  paymentMethod === 'pix'
                    ? 'text-primary border-primary bg-slate-50 font-bold'
                    : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                PIX
                <span className="hidden sm:inline-block text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">
                  -5% OFF
                </span>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 md:p-8">
              {paymentMethod === 'card' ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-900">Número do Cartão</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">credit_card</span>
                      </div>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder="0000 0000 0000 0000"
                        className="block w-full pl-10 pr-3 py-2.5 border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-900">Nome impresso no cartão</label>
                    <input
                      type="text"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      placeholder="NOME COMO NO CARTÃO"
                      className="block w-full px-3 py-2.5 border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:border-primary focus:ring-primary uppercase"
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900">Validade</label>
                      <input
                        type="text"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        placeholder="MM/AA"
                        className="block w-full px-3 py-2.5 border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:border-primary focus:ring-primary text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900 flex items-center gap-1">
                        CVV
                        <span className="material-symbols-outlined text-[16px] text-slate-400 cursor-help" title="Código de 3 dígitos no verso do cartão">
                          help
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                        placeholder="123"
                        className="block w-full px-3 py-2.5 border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:border-primary focus:ring-primary text-center"
                      />
                    </div>
                  </div>

                  {/* Installments */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-900">Parcelamento</label>
                    <select
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      className="block w-full px-3 py-2.5 border-slate-300 rounded-lg text-sm shadow-sm focus:border-primary focus:ring-primary bg-white"
                    >
                      <option value="1">1x de R$ 350,00 sem juros</option>
                      <option value="2">2x de R$ 175,00 sem juros</option>
                      <option value="3">3x de R$ 116,66 sem juros</option>
                    </select>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="size-48 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[80px] text-slate-400">qr_code_2</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 mb-1">Valor com desconto PIX</p>
                    <p className="text-3xl font-black text-primary">R$ 332,50</p>
                    <p className="text-sm text-slate-500 mt-2">Escaneie o QR Code com seu app de pagamentos</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined">timer</span>
                    <span className="font-medium">Código válido por 30 minutos</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="px-6 md:px-8 pb-8 pt-2">
              <button
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined group-hover:animate-pulse">lock</span>
                Finalizar Pagamento de R$ {paymentMethod === 'pix' ? '332,50' : '350,00'}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">encrypted</span>
                Seus dados estão protegidos por criptografia de ponta a ponta.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 order-1 lg:order-2">
          {/* Doctor Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 bg-slate-50/50">
              <div className="relative mb-4">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
                  alt="Dra. Ana Beatriz"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                  <span className="material-symbols-outlined text-white text-[14px] font-bold block">check</span>
                </div>
              </div>
              <h3 className="text-slate-900 text-xl font-bold leading-tight">Dra. Ana Beatriz Santos</h3>
              <p className="text-primary font-medium text-sm mt-1">Neurologista</p>
              <p className="text-slate-500 text-xs mt-1">CRM 54321-SP</p>
            </div>

            {/* Details List */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 text-primary p-2 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Data</p>
                  <p className="text-slate-900 text-sm font-medium">31 de Janeiro, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 text-primary p-2 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Horário</p>
                  <p className="text-slate-900 text-sm font-medium">14:00 - 15:00 (1h)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 text-primary p-2 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tipo</p>
                  <p className="text-slate-900 text-sm font-medium">Telemedicina</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-sm">Consulta</span>
                <span className="text-slate-900 text-sm font-medium">R$ 350,00</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">Taxa de Serviço</span>
                <span className="text-green-600 text-sm font-medium">Grátis</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="text-slate-900 font-bold text-lg">Total</span>
                <span className="text-primary font-black text-2xl tracking-tight">R$ 350,00</span>
              </div>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
              <span className="material-symbols-outlined text-green-600 text-[24px]">verified_user</span>
            </div>
            <div>
              <p className="text-green-800 font-bold text-sm">Garantia de Satisfação</p>
              <p className="text-green-700 text-xs leading-snug">
                Se não estiver satisfeito com o atendimento, devolvemos seu dinheiro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
