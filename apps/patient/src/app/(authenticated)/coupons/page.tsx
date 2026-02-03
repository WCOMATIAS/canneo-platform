'use client';

import { useState } from 'react';
import Link from 'next/link';

const coupons = [
  {
    id: 1,
    code: 'BEMVINDO15',
    description: '15% de desconto na primeira compra',
    discount: '15%',
    type: 'percentage',
    expiresAt: '28 Fev, 2026',
    minValue: 100,
    status: 'available',
  },
  {
    id: 2,
    code: 'FRETE50',
    description: 'R$ 50 de desconto no frete',
    discount: 'R$ 50',
    type: 'fixed',
    expiresAt: '15 Mar, 2026',
    minValue: 200,
    status: 'available',
  },
  {
    id: 3,
    code: 'CLUB20',
    description: '20% OFF para membros do Clube',
    discount: '20%',
    type: 'percentage',
    expiresAt: '31 Mar, 2026',
    minValue: 150,
    status: 'available',
  },
  {
    id: 4,
    code: 'PROMO10',
    description: '10% de desconto em qualquer pedido',
    discount: '10%',
    type: 'percentage',
    expiresAt: '10 Jan, 2026',
    minValue: 0,
    status: 'used',
    usedAt: '05 Jan, 2026',
  },
  {
    id: 5,
    code: 'NATAL2025',
    description: 'Desconto especial de Natal',
    discount: 'R$ 100',
    type: 'fixed',
    expiresAt: '25 Dez, 2025',
    minValue: 300,
    status: 'expired',
  },
];

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
  const [newCoupon, setNewCoupon] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredCoupons = coupons.filter((coupon) => coupon.status === activeTab);

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Cupons</h1>
          <p className="text-slate-500 mt-1">Gerencie seus cupons de desconto e promoções.</p>
        </div>
      </div>

      {/* Add Coupon */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Adicionar Cupom</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Digite o código do cupom"
            value={newCoupon}
            onChange={(e) => setNewCoupon(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
          />
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            Adicionar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Disponíveis
          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {coupons.filter((c) => c.status === 'available').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'used'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Utilizados
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            {coupons.filter((c) => c.status === 'used').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'expired'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Expirados
          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            {coupons.filter((c) => c.status === 'expired').length}
          </span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                coupon.status === 'available' ? 'border-slate-200' : 'border-slate-100 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Discount Badge */}
                <div className={`flex items-center justify-center px-8 py-6 ${
                  coupon.status === 'available'
                    ? 'bg-gradient-to-br from-primary to-teal-600'
                    : 'bg-slate-200'
                }`}>
                  <div className="text-center">
                    <p className={`text-3xl font-black ${coupon.status === 'available' ? 'text-white' : 'text-slate-500'}`}>
                      {coupon.discount}
                    </p>
                    <p className={`text-xs uppercase ${coupon.status === 'available' ? 'text-white/80' : 'text-slate-400'}`}>
                      desconto
                    </p>
                  </div>
                </div>

                {/* Coupon Info */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{coupon.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg font-mono text-sm font-bold text-slate-700">
                          {coupon.code}
                        </span>
                        {coupon.status === 'available' && (
                          <button
                            onClick={() => copyToClipboard(coupon.code, coupon.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {copiedId === coupon.id ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Válido até {coupon.expiresAt}
                        </span>
                        {coupon.minValue > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">shopping_cart</span>
                            Mínimo R$ {coupon.minValue}
                          </span>
                        )}
                      </div>
                    </div>
                    {coupon.status === 'available' && (
                      <Link
                        href="/marketplace"
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                      >
                        Usar agora
                      </Link>
                    )}
                    {coupon.status === 'used' && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        Usado em {coupon.usedAt}
                      </span>
                    )}
                    {coupon.status === 'expired' && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                        Expirado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              {activeTab === 'available' ? 'confirmation_number' : activeTab === 'used' ? 'check_circle' : 'schedule'}
            </span>
            <p className="text-slate-500">
              {activeTab === 'available' && 'Você não tem cupons disponíveis no momento'}
              {activeTab === 'used' && 'Nenhum cupom utilizado'}
              {activeTab === 'expired' && 'Nenhum cupom expirado'}
            </p>
          </div>
        )}
      </div>

      {/* Referral Card */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl">diversity_3</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Indique amigos e ganhe cupons!</h3>
              <p className="text-white/80 mt-1">
                Ganhe R$ 50 de desconto para cada amigo que fizer a primeira compra.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap">
            Convidar Amigos
          </button>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm text-white/70 mb-2">Seu código de indicação:</p>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/20 rounded-lg font-mono font-bold text-lg backdrop-blur-sm">
              MARIA2026
            </span>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined">content_copy</span>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
