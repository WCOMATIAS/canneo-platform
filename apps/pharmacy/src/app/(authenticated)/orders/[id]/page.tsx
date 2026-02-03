'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Card, Badge, Button } from '@/components/ui';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  prescriptionId?: string;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  timeline: { status: string; date: string; description: string }[];
  createdAt: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error' | 'gray'; icon: string }> = {
  pending: { label: 'Aguardando', variant: 'warning', icon: 'schedule' },
  confirmed: { label: 'Confirmado', variant: 'primary', icon: 'check_circle' },
  processing: { label: 'Preparando', variant: 'primary', icon: 'inventory_2' },
  ready: { label: 'Pronto para Envio', variant: 'success', icon: 'package_2' },
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
const mockOrder: Order = {
  id: 'ORD-001234',
  patientName: 'Maria Silva',
  patientEmail: 'maria.silva@email.com',
  patientPhone: '(11) 99999-0001',
  items: [
    { id: '1', name: 'CBD Oil Full Spectrum 3000mg', sku: 'CBD-FS-3000', quantity: 1, unitPrice: 35000 },
    { id: '2', name: 'CBD Capsulas 500mg', sku: 'CBD-CAP-500', quantity: 2, unitPrice: 5000 },
  ],
  totalAmount: 45000,
  status: 'pending',
  paymentMethod: 'PIX',
  prescriptionId: 'RX-001',
  shippingAddress: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Jardim Paulista',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01234-567',
  },
  timeline: [
    { status: 'created', date: '2024-01-20T10:30:00', description: 'Pedido criado' },
    { status: 'paid', date: '2024-01-20T10:32:00', description: 'Pagamento confirmado via PIX' },
  ],
  createdAt: '2024-01-20T10:30:00',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <Icon name="progress_activity" size="xl" className="text-primary-500" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Icon name="error" size="xl" className="text-gray-300 mb-4" />
        <p className="text-gray-500">Pedido nao encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" icon="arrow_back" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id}</h1>
            <p className="text-sm text-gray-500">
              Criado em {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        <Badge variant={statusConfig[order.status].variant} size="md">
          <Icon name={statusConfig[order.status].icon} size="sm" className="mr-1" />
          {statusConfig[order.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon name="medication" className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{item.quantity}x {formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Prescription */}
          {order.prescriptionId && (
            <Card className="border-warning-200 bg-warning-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Icon name="clinical_notes" className="text-warning-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-warning-900">Pedido com Receita Medica</h3>
                  <p className="text-sm text-warning-700 mb-3">
                    Este pedido requer validacao da receita medica antes do envio.
                  </p>
                  <Button variant="outline" size="sm" icon="visibility">
                    Ver Receita
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historico</h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">{event.description}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon name="person" size="sm" className="text-gray-400" />
                <span className="text-gray-900">{order.patientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="email" size="sm" className="text-gray-400" />
                <span className="text-gray-900">{order.patientEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="phone" size="sm" className="text-gray-400" />
                <span className="text-gray-900">{order.patientPhone}</span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereco de Entrega</h2>
            <div className="space-y-1 text-gray-600">
              <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
              {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
              <p>{order.shippingAddress.neighborhood}</p>
              <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
              <p>CEP: {order.shippingAddress.zipCode}</p>
            </div>
          </Card>

          {/* Payment */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagamento</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Icon name="pix" className="text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                <p className="text-sm text-success-600">Pago</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acoes</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <>
                  <Button variant="secondary" className="w-full" icon="check">
                    Aceitar Pedido
                  </Button>
                  <Button variant="outline" className="w-full text-error-600 border-error-300 hover:bg-error-50" icon="cancel">
                    Recusar Pedido
                  </Button>
                </>
              )}
              {order.status === 'confirmed' && (
                <Button variant="primary" className="w-full" icon="inventory_2">
                  Iniciar Preparacao
                </Button>
              )}
              {order.status === 'processing' && (
                <Button variant="secondary" className="w-full" icon="package_2">
                  Marcar como Pronto
                </Button>
              )}
              {order.status === 'ready' && (
                <Button variant="primary" className="w-full" icon="label">
                  Gerar Etiqueta de Envio
                </Button>
              )}
              <Button variant="outline" className="w-full" icon="print">
                Imprimir Pedido
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
