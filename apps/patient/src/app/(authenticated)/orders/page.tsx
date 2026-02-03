'use client';

import { useState } from 'react';
import Link from 'next/link';

const orders = [
  {
    id: 'ORD-925',
    date: '24/01/2026',
    products: [
      { name: 'Óleo CBD Full Spectrum 3000mg', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
    ],
    pharmacy: 'PharmaLife',
    total: 489,
    status: 'delivered',
  },
  {
    id: 'ORD-918',
    date: '20/01/2026',
    products: [
      { name: 'Creme Tópico CBD 500mg', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop' },
      { name: 'Cápsulas CBD 25mg', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop' },
    ],
    pharmacy: 'Drogaria Saúde+',
    total: 455.8,
    status: 'in_transit',
    trackingCode: 'BR123456789',
  },
  {
    id: 'ORD-901',
    date: '15/01/2026',
    products: [
      { name: 'Óleo CBD Broad Spectrum 1000mg', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=100&h=100&fit=crop' },
    ],
    pharmacy: 'Farmácia Viva Bem',
    total: 249.9,
    status: 'processing',
  },
  {
    id: 'ORD-889',
    date: '10/01/2026',
    products: [
      { name: 'Óleo CBD + CBN Sleep 2000mg', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
    ],
    pharmacy: 'PharmaLife',
    total: 420,
    status: 'delivered',
  },
  {
    id: 'ORD-875',
    date: '05/01/2026',
    products: [
      { name: 'Cápsulas CBD + Melatonina', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop' },
    ],
    pharmacy: 'Drogaria Saúde+',
    total: 189.9,
    status: 'cancelled',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Entregue
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            Em trânsito
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Em separação
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <span className="material-symbols-outlined text-sm">cancel</span>
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'in_progress' && (order.status === 'in_transit' || order.status === 'processing')) ||
      (activeTab === 'delivered' && order.status === 'delivered') ||
      (activeTab === 'cancelled' && order.status === 'cancelled');
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Minhas Compras</h1>
          <p className="text-slate-500 mt-1">Gerencie seus pedidos, repita compras e acompanhe o status de entrega.</p>
        </div>
        <Link
          href="/marketplace"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-xl">storefront</span>
          Ir para Marketplace
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Todos
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            {orders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'in_progress'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Em andamento
          <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {orders.filter((o) => o.status === 'in_transit' || o.status === 'processing').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'delivered'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Entregues
          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {orders.filter((o) => o.status === 'delivered').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cancelled'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Cancelados
          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            {orders.filter((o) => o.status === 'cancelled').length}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por ID do pedido ou medicamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700">
            Status: Todos
            <span className="material-symbols-outlined text-slate-400 text-xl">expand_more</span>
          </button>
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700">
            Data: Últimos 30 dias
            <span className="material-symbols-outlined text-slate-400 text-xl">calendar_today</span>
          </button>
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700">
            Farmácia: Todas
            <span className="material-symbols-outlined text-slate-400 text-xl">expand_more</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Pedido</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produto(s)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Farmácia</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.products.slice(0, 2).map((product, index) => (
                          <img
                            key={index}
                            src={product.image}
                            alt={product.name}
                            className="size-10 rounded-lg border-2 border-white object-cover"
                          />
                        ))}
                        {order.products.length > 2 && (
                          <div className="size-10 rounded-lg bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                            +{order.products.length - 2}
                          </div>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                          {order.products[0].name}
                        </p>
                        {order.products.length > 1 && (
                          <p className="text-xs text-slate-500">+{order.products.length - 1} item(s)</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.pharmacy}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Detalhes
                      </Link>
                      {(order.status === 'in_transit' || order.status === 'processing') && (
                        <Link
                          href={`/orders/${order.id}/tracking`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          Rastrear
                        </Link>
                      )}
                      {order.status === 'delivered' && (
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium transition-colors">
                          <span className="material-symbols-outlined text-sm">replay</span>
                          Repetir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">shopping_bag</span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum pedido encontrado</h3>
            <p className="text-slate-500 text-sm mb-6">Tente ajustar os filtros ou faça sua primeira compra</p>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">storefront</span>
              Ir para Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
