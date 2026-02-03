'use client';

import { useState } from 'react';
import { Icon, Card, Button } from '@/components/ui';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('pharmacy');
  const [formData, setFormData] = useState({
    pharmacyName: 'Farmacia Cannabis Care',
    cnpj: '12.345.678/0001-00',
    email: 'contato@cannabiscare.com.br',
    phone: '(11) 3000-0000',
    whatsapp: '(11) 99999-0000',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 100',
      neighborhood: 'Bela Vista',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    melhorEnvioToken: '',
    melhorEnvioEnabled: false,
    notifyNewOrders: true,
    notifyLowStock: true,
    lowStockThreshold: 10,
  });

  const tabs = [
    { id: 'pharmacy', label: 'Dados da Farmacia', icon: 'store' },
    { id: 'shipping', label: 'Integracoes de Envio', icon: 'local_shipping' },
    { id: 'notifications', label: 'Notificacoes', icon: 'notifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="mt-1 text-sm text-gray-500">Gerencie as configuracoes da sua farmacia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon name={tab.icon} size="sm" className={activeTab === tab.id ? 'text-primary-500' : ''} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'pharmacy' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados da Farmacia</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nome da Farmacia</label>
                    <input
                      type="text"
                      value={formData.pharmacyName}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">CNPJ</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      className="input bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">E-mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">WhatsApp (para notificacoes de pedidos)</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="input"
                  />
                </div>

                <hr className="my-6" />

                <h3 className="font-semibold text-gray-900 mb-4">Endereco</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Rua</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Numero</label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, number: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Complemento</label>
                    <input
                      type="text"
                      value={formData.address.complement}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, complement: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Bairro</label>
                    <input
                      type="text"
                      value={formData.address.neighborhood}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, neighborhood: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Cidade</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Estado</label>
                    <select
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="input"
                    >
                      <option value="SP">Sao Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PR">Parana</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">CEP</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button icon="save">Salvar Alteracoes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Icon name="local_shipping" className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Melhor Envio</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.melhorEnvioEnabled}
                          onChange={(e) => setFormData({ ...formData, melhorEnvioEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Integre com Melhor Envio para calcular fretes automaticamente e gerar etiquetas de envio.
                    </p>
                    {formData.melhorEnvioEnabled && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div>
                          <label className="label">Token de API</label>
                          <input
                            type="password"
                            value={formData.melhorEnvioToken}
                            onChange={(e) => setFormData({ ...formData, melhorEnvioToken: e.target.value })}
                            placeholder="Insira seu token da API Melhor Envio"
                            className="input font-mono"
                          />
                        </div>
                        <Button variant="outline" size="sm" icon="open_in_new">
                          Obter Token no Melhor Envio
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon name="mail" className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Correios (Sigep Web)</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Em breve</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Integracao direta com Correios via Sigep Web para geração de etiquetas.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button icon="save">Salvar Configuracoes</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferencias de Notificacao</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Novos Pedidos</p>
                    <p className="text-sm text-gray-500">Receber notificacao quando um novo pedido for realizado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyNewOrders}
                      onChange={(e) => setFormData({ ...formData, notifyNewOrders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Estoque Baixo</p>
                    <p className="text-sm text-gray-500">Receber alerta quando um produto atingir o estoque minimo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyLowStock}
                      onChange={(e) => setFormData({ ...formData, notifyLowStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {formData.notifyLowStock && (
                  <div className="pt-2">
                    <label className="label">Limite de Estoque para Alerta</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="input w-24"
                      />
                      <span className="text-gray-500">unidades</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button icon="save">Salvar Preferencias</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
