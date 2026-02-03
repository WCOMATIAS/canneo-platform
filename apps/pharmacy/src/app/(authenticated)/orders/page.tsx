'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Card, Badge, Button } from '@/components/ui';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  patientName: string;
  patientPhone: string;
  items: { name: string; quantity: number }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  prescriptionId?: string;
}

const statusTabs: { id: OrderStatus | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'list' },
  { id: 'pending', label: 'Novos', icon: 'notifications_active' },
  { id: 'confirmed', label: 'Confirmados', icon: 'check_circle' },
  { id: 'processing', label: 'Em Preparo', icon: 'inventory_2' },
  { id: 'ready', label: 'Prontos', icon: 'package_2' },
  { id: 'shipped', label: 'Enviados', icon: 'local_shipping' },
  { id: 'delivered', label: 'Entregues', icon: 'done_all' },
  { id: 'cancelled', label: 'Cancelados', icon: 'cancel' },
];

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error' | 'gray'; icon: string }> = {
  pending: { label: 'Novo', variant: 'warning', icon: 'schedule' },
  confirmed: { label: 'Confirmado', variant: 'primary', icon: 'check_circle' },
  processing: { label: 'Preparando', variant: 'primary', icon: 'inventory_2' },
  ready: { label: 'Pronto', variant: 'success', icon: 'package_2' },
  shipped: { label: 'Enviado', variant: 'success', icon: 'local_shipping' },
  delivered: { label: 'Entregue', variant: 'success', icon: 'done_all' },
  cancelled: { label: 'Cancelado', variant: 'gray', icon: 'cancel' },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

// Mock data
const mockOrders: Order[] = [
  { id: 'ORD-001234', patientName: 'Maria Silva', patientPhone: '(11) 99999-0001', items: [{ name: 'CBD Oil 3000mg', quantity: 1 }, { name: 'CBD Capsulas', quantity: 2 }], totalAmount: 45000, status: 'pending', createdAt: '2024-01-20T10:30:00', prescriptionId: 'RX-001' },
  { id: 'ORD-001233', patientName: 'Joao Santos', patientPhone: '(11) 99999-0002', items: [{ name: 'CBD Isolado 1500mg', quantity: 3 }], totalAmount: 89000, status: 'processing', createdAt: '2024-01-20T09:15:00', prescriptionId: 'RX-002' },
  { id: 'ORD-001232', patientName: 'Ana Oliveira', patientPhone: '(11) 99999-0003', items: [{ name: 'CBD + CBN Sleep', quantity: 1 }], totalAmount: 32000, status: 'pending', createdAt: '2024-01-20T08:45:00' },
  { id: 'ORD-001231', patientName: 'Carlos Lima', patientPhone: '(11) 99999-0004', items: [{ name: 'CBD Oil 1000mg', quantity: 2 }], totalAmount: 67500, status: 'confirmed', createdAt: '2024-01-19T16:20:00', prescriptionId: 'RX-003' },
  { id: 'ORD-001230', patientName: 'Paula Costa', patientPhone: '(11) 99999-0005', items: [{ name: 'Full Spectrum 6000mg', quantity: 1 }, { name: 'CBD Creme', quantity: 1 }], totalAmount: 125000, status: 'ready', createdAt: '2024-01-19T14:00:00' },
  { id: 'ORD-001229', patientName: 'Roberto Alves', patientPhone: '(11) 99999-0006', items: [{ name: 'CBD Oil 2000mg', quantity: 1 }], totalAmount: 35000, status: 'shipped', createdAt: '2024-01-18T11:30:00', prescriptionId: 'RX-004' },
  { id: 'ORD-001228', patientName: 'Lucia Mendes', patientPhone: '(11) 99999-0007', items: [{ name: 'CBD Isolado', quantity: 2 }], totalAmount: 56000, status: 'delivered', createdAt: '2024-01-17T09:00:00' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <Icon name="progress_activity" size="xl" className="text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie os pedidos de medicamentos</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por numero do pedido ou cliente..."
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => {
          const count = tab.id === 'all' ? orders.length : tabCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon name={tab.icon} size="sm" />
              {tab.label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card padding="none">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="shopping_bag" size="xl" className="text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Itens</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                      {order.prescriptionId && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-warning-600">
                          <Icon name="clinical_notes" size="sm" />
                          Receita
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{order.patientName}</p>
                      <p className="text-xs text-gray-500">{order.patientPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={statusConfig[order.status].variant}>
                        <Icon name={statusConfig[order.status].icon} size="sm" className="mr-1" />
                        {statusConfig[order.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                          <Button variant="secondary" size="sm" icon="check">
                            Aceitar
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button variant="primary" size="sm" icon="inventory_2">
                            Preparar
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button variant="secondary" size="sm" icon="package_2">
                            Pronto
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button variant="primary" size="sm" icon="label">
                            Etiqueta
                          </Button>
                        )}
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" icon="visibility" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
