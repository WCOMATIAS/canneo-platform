'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const plans = {
  basic: { name: 'Básico', price: 29.9, annual: 299, features: ['10% de desconto', 'Frete grátis acima de R$ 200'] },
  premium: { name: 'Premium', price: 49.9, annual: 499, features: ['20% de desconto', 'Frete grátis', '15% OFF consultas'] },
  family: { name: 'Familiar', price: 79.9, annual: 799, features: ['25% de desconto', 'Até 4 dependentes', 'Gestor dedicado'] },
};

function ClubCheckoutContent() {
  const searchParams = useSearchParams();
  const planId = (searchParams.get('plan') || 'premium') as keyof typeof plans;
  const plan = plans[planId] || plans.premium;

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [coupon, setCoupon] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const price = billingPeriod === 'monthly' ? plan.price : plan.annual;
  const discount = billingPeriod === 'annual' ? (plan.price * 12 - plan.annual) : 0;

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
        <h1 className="text-3xl font-black text-slate-900">Finalizar Assinatura</h1>
        <p className="text-slate-500 mt-1">Complete sua adesão ao Clube de Saúde CANNEO.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Selected */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Plano selecionado</p>
                <p className="text-xl font-bold text-slate-900">{plan.name}</p>
              </div>
              <Link href="/club" className="text-primary font-medium text-sm hover:underline">
                Alterar
              </Link>
            </div>
          </div>

          {/* Billing Period */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Período de Cobrança</h3>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  billingPeriod === 'monthly'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="billing"
                  value="monthly"
                  checked={billingPeriod === 'monthly'}
                  onChange={() => setBillingPeriod('monthly')}
                  className="hidden"
                />
                <span className="font-bold text-slate-900">Mensal</span>
                <span className="text-2xl font-black text-primary mt-2">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm text-slate-500">por mês</span>
              </label>
              <label
                className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  billingPeriod === 'annual'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  Economize 17%
                </span>
                <input
                  type="radio"
                  name="billing"
                  value="annual"
                  checked={billingPeriod === 'annual'}
                  onChange={() => setBillingPeriod('annual')}
                  className="hidden"
                />
                <span className="font-bold text-slate-900">Anual</span>
                <span className="text-2xl font-black text-primary mt-2">
                  R$ {plan.annual.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm text-slate-500">por ano</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Forma de Pagamento</h3>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined">credit_card</span>
                Cartão de Crédito
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined">qr_code</span>
                PIX
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="Como está no cartão"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">lock</span>
                  Pagamento recorrente. Você será cobrado automaticamente a cada período.
                </p>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-slate-100 rounded-xl mb-4">
                  <span className="material-symbols-outlined text-6xl text-slate-400">qr_code_2</span>
                </div>
                <p className="text-slate-600 mb-2">O QR Code será gerado após confirmar a assinatura</p>
                <p className="text-sm text-slate-500">Você terá 30 minutos para efetuar o pagamento</p>
              </div>
            )}
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Cupom de Desconto</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Digite seu cupom"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
              />
              <button className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Resumo da Assinatura</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Plano {plan.name}</span>
                <span className="font-medium">R$ {billingPeriod === 'monthly' ? plan.price.toFixed(2).replace('.', ',') : (plan.price * 12).toFixed(2).replace('.', ',')}</span>
              </div>
              {billingPeriod === 'annual' && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto anual</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-slate-900">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">R$ {price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-slate-500">{billingPeriod === 'monthly' ? '/mês' : '/ano'}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600">
                  Li e aceito os{' '}
                  <a href="#" className="text-primary hover:underline">termos de adesão</a>
                  {' '}e a{' '}
                  <a href="#" className="text-primary hover:underline">política de privacidade</a>
                </span>
              </label>

              <button
                disabled={!acceptTerms}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">verified</span>
                Confirmar Assinatura
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                Pagamento seguro processado por Stripe
              </p>
            </div>

            {/* Benefits Reminder */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-700 mb-3">Você terá acesso a:</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ClubCheckoutContent />
    </Suspense>
  );
}
