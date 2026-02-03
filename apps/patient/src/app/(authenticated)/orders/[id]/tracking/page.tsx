'use client';

import { useState } from 'react';
import Link from 'next/link';

const orderDetails = {
  id: 'ORD-918',
  trackingCode: 'BR123456789CD',
  estimatedDelivery: 'Hoje, 15:00 - 15:30',
  pharmacy: 'Farmácia CANNEO Central SP',
  products: [
    { name: 'Óleo CBD Full Spectrum 3000mg', description: '30ml', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
    { name: 'Creme Tópico CBD 500mg', description: '50g', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop' },
  ],
  total: 666.9,
};

const timeline = [
  { id: 1, title: 'Pedido Recebido', description: 'Confirmado e validado', time: '10:30', date: '31 Jan', completed: true },
  { id: 2, title: 'Pagamento Aprovado', description: 'Pagamento confirmado', time: '10:32', date: '31 Jan', completed: true },
  { id: 3, title: 'Em Separação', description: 'Embalado com segurança', time: '11:15', date: '31 Jan', completed: true },
  { id: 4, title: 'Enviado', description: 'Saiu para entrega', time: '14:20', date: '31 Jan', completed: true, current: true },
  { id: 5, title: 'Saiu para Entrega', description: 'Próximo ao Centro - Av. Paulista', time: null, date: null, completed: false },
  { id: 6, title: 'Entregue', description: 'Estimado para as 15:00', time: null, date: null, completed: false },
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false);

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(orderDetails.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href="/orders"
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium w-fit"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar para Meus Pedidos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Pedido #{params.id}</h1>
                <p className="text-slate-500 text-sm mt-1">Estimativa: {orderDetails.estimatedDelivery}</p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wider">
                Em Rota
              </span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="p-6 border-b border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-4 items-start">
              <div className="size-16 rounded-lg bg-white p-1 shrink-0 border border-slate-100">
                <img
                  src={orderDetails.products[0].image}
                  alt={orderDetails.products[0].name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{orderDetails.products[0].name}</p>
                <p className="text-sm text-slate-500">{orderDetails.products[0].description}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  {orderDetails.pharmacy}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Status da Entrega</h3>
            <div className="relative pl-2 space-y-0">
              {/* Line Background */}
              <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-200"></div>

              {timeline.map((step, index) => (
                <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  <div
                    className={`relative z-10 flex items-center justify-center size-10 rounded-full shrink-0 ${
                      step.completed
                        ? step.current
                          ? 'bg-white border-2 border-primary text-primary animate-pulse'
                          : 'bg-primary text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {step.completed ? (step.current ? 'local_shipping' : 'check') :
                       step.title === 'Entregue' ? 'home_pin' : 'schedule'}
                    </span>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`text-sm font-bold ${step.current ? 'text-primary' : step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${step.current ? 'text-slate-900 font-medium' : 'text-slate-500'} mt-0.5`}>
                      {step.description}
                    </p>
                    {step.time && step.date && (
                      <p className="text-xs text-slate-400 mt-1">{step.date} às {step.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Code */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Código de Rastreio</p>
                <p className="font-mono font-bold text-slate-900">{orderDetails.trackingCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyTrackingCode}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <a
                  href={`https://www.correios.com.br/rastreio/${orderDetails.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  Correios
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map & Details */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 to-slate-300/50"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-2">location_on</span>
                <p className="text-sm font-medium text-slate-600">Mapa de rastreamento</p>
                <Link
                  href={`/orders/${params.id}/live`}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">my_location</span>
                  Ver Rastreamento ao Vivo
                </Link>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Detalhes do Pedido
            </h3>
            <div className="space-y-3">
              {orderDetails.products.map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total do Pedido</span>
              <span className="text-xl font-black text-primary">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">help</span>
              Precisa de Ajuda?
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">schedule</span>
                  <span className="font-medium text-slate-900">Alterar horário de entrega</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">location_on</span>
                  <span className="font-medium text-slate-900">Alterar endereço</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">support_agent</span>
                  <span className="font-medium text-slate-900">Falar com suporte</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
