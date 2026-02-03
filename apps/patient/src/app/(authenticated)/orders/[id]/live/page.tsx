'use client';

import Link from 'next/link';

const deliveryDetails = {
  orderId: 'ORD-918',
  estimatedTime: '10 minutos',
  estimatedArrival: '15:25',
  driver: {
    name: 'Carlos Silva',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    phone: '+55 11 98765-4321',
    rating: 4.9,
  },
  address: {
    street: 'Av. Paulista, 1000 - Apto 121',
    neighborhood: 'Bela Vista',
    city: 'São Paulo - SP',
    instructions: 'Portaria 24h. Avisar no interfone 121.',
  },
  status: 'Em rota de entrega',
};

export default function LiveTrackingPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] -m-6">
      {/* Left Panel - Details */}
      <div className="w-full lg:w-[450px] flex flex-col bg-white border-r border-slate-200 h-full overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <Link
            href={`/orders/${params.id}/tracking`}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm mb-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Voltar para Rastreamento
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pedido #{deliveryDetails.orderId}</h1>
              <p className="text-slate-500 text-sm mt-1">Chegada estimada: {deliveryDetails.estimatedArrival}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider animate-pulse">
              Ao Vivo
            </span>
          </div>
        </div>

        {/* ETA Banner */}
        <div className="p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-16 rounded-full bg-white/20">
              <span className="material-symbols-outlined text-3xl">schedule</span>
            </div>
            <div>
              <p className="text-white/80 text-sm">Tempo estimado de chegada</p>
              <p className="text-3xl font-black">{deliveryDetails.estimatedTime}</p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="material-symbols-outlined text-blue-600 text-2xl">local_shipping</span>
            <div>
              <p className="font-bold text-blue-800">{deliveryDetails.status}</p>
              <p className="text-sm text-blue-600">O entregador está a caminho do seu endereço</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4">Entregador</h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={deliveryDetails.driver.photo}
              alt={deliveryDetails.driver.name}
              className="size-16 rounded-full object-cover ring-2 ring-white shadow-lg"
            />
            <div className="flex-1">
              <p className="font-bold text-slate-900">{deliveryDetails.driver.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                <span className="text-sm font-medium text-slate-700">{deliveryDetails.driver.rating}</span>
              </div>
            </div>
            <a
              href={`tel:${deliveryDetails.driver.phone}`}
              className="flex items-center justify-center size-12 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4">Endereço de Entrega</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div>
                <p className="font-medium text-slate-900">{deliveryDetails.address.street}</p>
                <p className="text-sm text-slate-600">{deliveryDetails.address.neighborhood}</p>
                <p className="text-sm text-slate-600">{deliveryDetails.address.city}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Instruções de entrega</p>
              <p className="text-sm text-slate-700">{deliveryDetails.address.instructions}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 mt-auto space-y-3">
          <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            <span className="material-symbols-outlined">share</span>
            Compartilhar Localização
          </button>
          <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            <span className="material-symbols-outlined">edit_location_alt</span>
            Atualizar Instruções
          </button>
          <Link
            href="/support"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            <span className="material-symbols-outlined">support_agent</span>
            Preciso de Ajuda
          </Link>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 bg-slate-200 relative">
        {/* Map Placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
          {/* Fake map elements */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated delivery route */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Destination */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-primary">home_pin</span>
                <span className="text-xs font-bold text-slate-600 mt-1">Seu endereço</span>
              </div>

              {/* Driver */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                <div className="size-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-2xl">local_shipping</span>
                </div>
                <div className="mt-2 px-3 py-1 rounded-full bg-white shadow-md text-xs font-bold text-slate-700">
                  {deliveryDetails.estimatedTime}
                </div>
              </div>

              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256">
                <path
                  d="M 128 90 L 128 200"
                  stroke="#2b8cee"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="size-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-slate-600">add</span>
            </button>
            <button className="size-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-slate-600">remove</span>
            </button>
            <button className="size-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-slate-600">my_location</span>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Legenda</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
              <div className="size-4 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[10px]">local_shipping</span>
              </div>
              <span>Entregador</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="material-symbols-outlined text-primary text-base">home_pin</span>
              <span>Destino</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
