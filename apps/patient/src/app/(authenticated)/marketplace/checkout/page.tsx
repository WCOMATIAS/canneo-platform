'use client';

import { useState } from 'react';
import Link from 'next/link';

const cartItems = [
  {
    id: 1,
    name: 'Óleo de CBD Full Spectrum 3000mg',
    description: '30ml',
    price: 489,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Creme Tópico Alívio Rápido CBD 500mg',
    description: '50g',
    price: 155.9,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop',
  },
];

export default function MarketplaceCheckoutPage() {
  const [items, setItems] = useState(cartItems);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === 'express' ? 35 : shippingMethod === 'standard' ? 22 : 0;
  const discount = 0;
  const total = subtotal + shippingCost - discount;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Finalizar Compra</h1>
          <p className="text-slate-500 mt-1">Revise seus dados e escolha a forma de pagamento.</p>
        </div>
        {/* Steps */}
        <div className="hidden lg:flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-primary font-medium">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Identificação
          </span>
          <span className="w-8 h-px bg-slate-200"></span>
          <span className="text-primary font-bold">Checkout</span>
          <span className="w-8 h-px bg-slate-200"></span>
          <span className="text-slate-400">Confirmação</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Cart Items */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">shopping_cart</span>
              <h2 className="text-xl font-bold">Produtos ({items.length})</h2>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="size-20 rounded-lg bg-white p-1 shrink-0 border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Linked Prescription */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <h2 className="text-xl font-bold">Receita Vinculada</h2>
              </div>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Válida</span>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">verified</span>
                <div>
                  <p className="font-medium text-green-800">Receita #REC-2026-001</p>
                  <p className="text-sm text-green-600">Dr. Ricardo Silva • Emitida em 24/01/2026</p>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <h2 className="text-xl font-bold">Endereço de Entrega</h2>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">Alterar</button>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300">
              <p className="font-bold text-slate-900">Maria Silva Santos</p>
              <p className="text-sm text-slate-600 mt-1">Av. Paulista, 1000 - Apto 121</p>
              <p className="text-sm text-slate-600">Bela Vista, São Paulo - SP</p>
              <p className="text-sm text-slate-600">CEP: 01310-100</p>
            </div>
          </section>

          {/* Shipping Method */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <h2 className="text-xl font-bold">Modalidade de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                  shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">Entrega Padrão</p>
                  <p className="text-xs text-slate-500">5-7 dias úteis</p>
                  <p className="font-bold text-primary mt-2">R$ 22,00</p>
                </div>
              </label>
              <label
                className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                  shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">Entrega Expressa</p>
                  <p className="text-xs text-slate-500">2-3 dias úteis</p>
                  <p className="font-bold text-primary mt-2">R$ 35,00</p>
                </div>
              </label>
              <label
                className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                  shippingMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="pickup"
                  checked={shippingMethod === 'pickup'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">Retirar na Farmácia</p>
                  <p className="text-xs text-slate-500">Disponível em 2h</p>
                  <p className="font-bold text-green-600 mt-2">Grátis</p>
                </div>
              </label>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">payments</span>
              <h2 className="text-xl font-bold">Forma de Pagamento</h2>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-slate-100 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  paymentMethod === 'card' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">credit_card</span>
                Cartão de Crédito
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  paymentMethod === 'pix' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">qr_code</span>
                PIX
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 py-3 px-4 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full rounded-lg border-slate-200 bg-slate-50 py-3 px-4 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full rounded-lg border-slate-200 bg-slate-50 py-3 px-4 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="COMO ESTÁ NO CARTÃO"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 py-3 px-4 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parcelamento</label>
                  <select className="w-full rounded-lg border-slate-200 bg-slate-50 py-3 px-4 focus:ring-primary focus:border-primary">
                    <option>1x de R$ {total.toFixed(2).replace('.', ',')} sem juros</option>
                    <option>2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                    <option>3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <div className="size-48 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-6xl text-slate-400">qr_code_2</span>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  O QR Code será gerado após confirmar o pedido
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold">Resumo do Pedido</h2>
            </div>

            {/* Coupon */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cupom de desconto"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                />
                <button className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors">
                  Aplicar
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="p-6 bg-slate-50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Frete</span>
                <span className="font-medium text-slate-900">
                  {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Desconto</span>
                  <span className="font-medium text-green-600">-R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold">Total Geral</span>
                <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <Link
                href="/orders/confirmed"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all mt-4"
              >
                Finalizar Compra e Pagar
                <span className="material-symbols-outlined">lock</span>
              </Link>
              <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-wider">
                Ao finalizar você concorda com nossos termos de uso e política de privacidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 py-8 border-t border-slate-200 mt-4">
        <div className="flex flex-col items-center opacity-60">
          <span className="material-symbols-outlined text-3xl mb-1">verified_user</span>
          <span className="text-xs font-bold uppercase">Pagamento Seguro</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <span className="material-symbols-outlined text-3xl mb-1">encrypted</span>
          <span className="text-xs font-bold uppercase">SSL Criptografado</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <span className="material-symbols-outlined text-3xl mb-1">health_and_safety</span>
          <span className="text-xs font-bold uppercase">Selo ANVISA</span>
        </div>
      </div>
    </div>
  );
}
