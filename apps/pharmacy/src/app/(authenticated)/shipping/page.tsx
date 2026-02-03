'use client';

import { useState, useEffect } from 'react';
import { Icon, Card, Badge, Button } from '@/components/ui';

type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'returned';

interface Shipment {
  id: string;
  orderId: string;
  patientName: string;
  trackingCode?: string;
  carrier?: string;
  status: ShipmentStatus;
  destination: {
    city: string;
    state: string;
    zipCode: string;
  };
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

const statusTabs: { id: ShipmentStatus | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'list' },
  { id: 'pending', label: 'Aguardando', icon: 'schedule' },
  { id: 'in_transit', label: 'Em Transito', icon: 'local_shipping' },
  { id: 'delivered', label: 'Entregues', icon: 'done_all' },
  { id: 'returned', label: 'Devolvidos', icon: 'undo' },
];

const statusConfig: Record<ShipmentStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error'; icon: string }> = {
  pending: { label: 'Aguardando Envio', variant: 'warning', icon: 'schedule' },
  in_transit: { label: 'Em Transito', variant: 'primary', icon: 'local_shipping' },
  delivered: { label: 'Entregue', variant: 'success', icon: 'done_all' },
  returned: { label: 'Devolvido', variant: 'error', icon: 'undo' },
};

const carriers = [
  { code: 'correios', name: 'Correios' },
  { code: 'jadlog', name: 'Jadlog' },
  { code: 'loggi', name: 'Loggi' },
  { code: 'melhorenvio', name: 'Melhor Envio' },
];

// Mock data
const mockShipments: Shipment[] = [
  { id: '1', orderId: 'ORD-001230', patientName: 'Paula Costa', status: 'pending', destination: { city: 'Sao Paulo', state: 'SP', zipCode: '01234-567' }, createdAt: '2024-01-19T14:00:00' },
  { id: '2', orderId: 'ORD-001229', patientName: 'Roberto Alves', trackingCode: 'BR123456789BR', carrier: 'Correios', status: 'in_transit', destination: { city: 'Rio de Janeiro', state: 'RJ', zipCode: '20000-000' }, shippedAt: '2024-01-18T15:00:00', createdAt: '2024-01-18T11:30:00' },
  { id: '3', orderId: 'ORD-001228', patientName: 'Lucia Mendes', trackingCode: 'JD987654321', carrier: 'Jadlog', status: 'delivered', destination: { city: 'Curitiba', state: 'PR', zipCode: '80000-000' }, shippedAt: '2024-01-16T10:00:00', deliveredAt: '2024-01-17T14:00:00', createdAt: '2024-01-15T09:00:00' },
  { id: '4', orderId: 'ORD-001227', patientName: 'Fernando Silva', trackingCode: 'BR111222333BR', carrier: 'Correios', status: 'in_transit', destination: { city: 'Belo Horizonte', state: 'MG', zipCode: '30000-000' }, shippedAt: '2024-01-19T09:00:00', createdAt: '2024-01-18T16:00:00' },
];

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingForm, setTrackingForm] = useState({ trackingCode: '', carrier: 'correios' });

  useEffect(() => {
    setTimeout(() => {
      setShipments(mockShipments);
      setLoading(false);
    }, 500);
  }, []);

  const filteredShipments = shipments.filter((shipment) => {
    return activeTab === 'all' || shipment.status === activeTab;
  });

  const tabCounts = shipments.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
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
          <h1 className="text-2xl font-bold text-gray-900">Envios</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie os envios de pedidos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => {
          const count = tab.id === 'all' ? shipments.length : tabCounts[tab.id] || 0;
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

      {/* Shipments Table */}
      <Card padding="none">
        {filteredShipments.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="local_shipping" size="xl" className="text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum envio encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destinatario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rastreio</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{shipment.orderId}</p>
                      <p className="text-xs text-gray-500">{new Date(shipment.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{shipment.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{shipment.destination.city}/{shipment.destination.state}</p>
                      <p className="text-xs text-gray-500">CEP: {shipment.destination.zipCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      {shipment.trackingCode ? (
                        <div>
                          <p className="font-mono text-sm text-gray-900">{shipment.trackingCode}</p>
                          <p className="text-xs text-gray-500">{shipment.carrier}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={statusConfig[shipment.status].variant}>
                        <Icon name={statusConfig[shipment.status].icon} size="sm" className="mr-1" />
                        {statusConfig[shipment.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {shipment.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon="label"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setTrackingForm({ trackingCode: '', carrier: 'correios' });
                            }}
                          >
                            Gerar Etiqueta
                          </Button>
                        )}
                        {shipment.status === 'in_transit' && shipment.trackingCode && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon="open_in_new"
                            onClick={() => window.open(`https://rastreamento.correios.com.br/app/index.php?objeto=${shipment.trackingCode}`, '_blank')}
                          >
                            Rastrear
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" icon="visibility" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Shipping Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Informar Envio</h2>
              <button
                onClick={() => setSelectedShipment(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Pedido</p>
                <p className="font-medium text-gray-900">#{selectedShipment.orderId} - {selectedShipment.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="text-gray-900">{selectedShipment.destination.city}/{selectedShipment.destination.state}</p>
                <p className="text-xs text-gray-500">CEP: {selectedShipment.destination.zipCode}</p>
              </div>
              <div>
                <label className="label">Transportadora</label>
                <select
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                  className="input"
                >
                  {carriers.map((carrier) => (
                    <option key={carrier.code} value={carrier.code}>{carrier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Codigo de Rastreio</label>
                <input
                  type="text"
                  value={trackingForm.trackingCode}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingCode: e.target.value.toUpperCase() })}
                  placeholder="Ex: BR123456789BR"
                  className="input font-mono"
                />
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="info" className="text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Integracao Melhor Envio</p>
                    <p className="text-sm text-primary-700">
                      Use a integracao com Melhor Envio para gerar etiquetas automaticamente.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" icon="open_in_new">
                      Configurar Integracao
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedShipment(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" icon="local_shipping">
                  Confirmar Envio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
