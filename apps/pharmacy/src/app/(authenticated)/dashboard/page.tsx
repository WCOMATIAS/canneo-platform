'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Card, StatsCard, Badge, Button } from '@/components/ui';

interface DashboardStats {
  pendingOrders: number;
  processingOrders: number;
  shippedToday: number;
  lowStockProducts: number;
  totalRevenue: number;
  revenueChange: number;
}

interface RecentOrder {
  id: string;
  patientName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped';
  itemCount: number;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

const statusConfig = {
  pending: { label: 'Novo', variant: 'warning' as const, icon: 'schedule' },
  confirmed: { label: 'Confirmado', variant: 'primary' as const, icon: 'check_circle' },
  processing: { label: 'Preparando', variant: 'primary' as const, icon: 'inventory_2' },
  shipped: { label: 'Enviado', variant: 'success' as const, icon: 'local_shipping' },
};

// Mock data for demonstration
const mockStats: DashboardStats = {
  pendingOrders: 8,
  processingOrders: 5,
  shippedToday: 12,
  lowStockProducts: 3,
  totalRevenue: 4523000,
  revenueChange: 12.5,
};

const mockOrders: RecentOrder[] = [
  { id: 'ORD-001234', patientName: 'Maria Silva', totalAmount: 45000, status: 'pending', itemCount: 2, createdAt: '2024-01-20T10:30:00' },
  { id: 'ORD-001233', patientName: 'Joao Santos', totalAmount: 89000, status: 'processing', itemCount: 3, createdAt: '2024-01-20T09:15:00' },
  { id: 'ORD-001232', patientName: 'Ana Oliveira', totalAmount: 32000, status: 'pending', itemCount: 1, createdAt: '2024-01-20T08:45:00' },
  { id: 'ORD-001231', patientName: 'Carlos Lima', totalAmount: 67500, status: 'confirmed', itemCount: 2, createdAt: '2024-01-19T16:20:00' },
  { id: 'ORD-001230', patientName: 'Paula Costa', totalAmount: 125000, status: 'shipped', itemCount: 4, createdAt: '2024-01-19T14:00:00' },
];

const mockLowStock: LowStockProduct[] = [
  { id: '1', name: 'CBD Oil Full Spectrum 3000mg', sku: 'CBD-FS-3000', quantity: 3, minQuantity: 10 },
  { id: '2', name: 'CBD Isolado 1500mg', sku: 'CBD-ISO-1500', quantity: 5, minQuantity: 15 },
  { id: '3', name: 'CBD + CBN Sleep 1000mg', sku: 'CBD-CBN-1000', quantity: 2, minQuantity: 8 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setRecentOrders(mockOrders);
      setLowStockProducts(mockLowStock);
      setLoading(false);
    }, 500);
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Visao geral das operacoes da farmacia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pedidos Novos"
          value={stats?.pendingOrders || 0}
          icon="notifications_active"
          iconColor="text-warning-500"
          iconBgColor="bg-warning-50"
          link={{ href: '/orders?status=pending', label: 'Ver pedidos' }}
        />
        <StatsCard
          title="Em Preparo"
          value={stats?.processingOrders || 0}
          icon="inventory_2"
          iconColor="text-primary-500"
          iconBgColor="bg-primary-50"
          link={{ href: '/orders?status=processing', label: 'Ver pedidos' }}
        />
        <StatsCard
          title="Enviados Hoje"
          value={stats?.shippedToday || 0}
          icon="local_shipping"
          iconColor="text-success-500"
          iconBgColor="bg-success-50"
          link={{ href: '/shipping', label: 'Ver envios' }}
        />
        <StatsCard
          title="Faturamento do Dia"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon="payments"
          iconColor="text-purple-500"
          iconBgColor="bg-purple-50"
          trend={stats?.revenueChange ? { value: stats.revenueChange, label: 'vs ontem' } : undefined}
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-error-200 bg-error-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <Icon name="warning" className="text-error-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-error-900 mb-2">Alerta de Estoque Baixo</h3>
              <p className="text-sm text-error-700 mb-3">
                {lowStockProducts.length} produtos estao com estoque abaixo do minimo
              </p>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-error-600">{product.quantity} un.</p>
                      <p className="text-xs text-gray-500">Min: {product.minQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/inventory?lowStock=true">
                  <Button variant="outline" size="sm" icon="arrow_forward" iconPosition="right">
                    Ver todos os produtos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ultimos Pedidos</h2>
          <Link href="/orders">
            <Button variant="ghost" size="sm" icon="arrow_forward" iconPosition="right">
              Ver todos
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Itens</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{order.patientName}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-900">{order.itemCount}</span>
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
                  <td className="px-6 py-4 text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" icon="visibility">
                        Ver
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
