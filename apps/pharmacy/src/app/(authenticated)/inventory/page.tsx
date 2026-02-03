'use client';

import { useState, useEffect } from 'react';
import { Icon, Card, Badge, Button } from '@/components/ui';
import clsx from 'clsx';

type ProductStatus = 'active' | 'low' | 'out';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minQuantity: number;
  requiresPrescription: boolean;
  isActive: boolean;
}

const categories = ['Todos', 'Oleos', 'Capsulas', 'Cremes', 'Flores', 'Acessorios'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function getProductStatus(product: Product): ProductStatus {
  if (product.quantity === 0) return 'out';
  if (product.quantity <= product.minQuantity) return 'low';
  return 'active';
}

const statusConfig: Record<ProductStatus, { label: string; variant: 'success' | 'warning' | 'error'; icon: string }> = {
  active: { label: 'Em Estoque', variant: 'success', icon: 'check_circle' },
  low: { label: 'Estoque Baixo', variant: 'warning', icon: 'warning' },
  out: { label: 'Esgotado', variant: 'error', icon: 'error' },
};

// Mock data
const mockProducts: Product[] = [
  { id: '1', name: 'CBD Oil Full Spectrum 3000mg', sku: 'CBD-FS-3000', category: 'Oleos', price: 35000, quantity: 3, minQuantity: 10, requiresPrescription: true, isActive: true },
  { id: '2', name: 'CBD Isolado 1500mg', sku: 'CBD-ISO-1500', category: 'Oleos', price: 28000, quantity: 5, minQuantity: 15, requiresPrescription: true, isActive: true },
  { id: '3', name: 'CBD + CBN Sleep 1000mg', sku: 'CBD-CBN-1000', category: 'Oleos', price: 32000, quantity: 2, minQuantity: 8, requiresPrescription: true, isActive: true },
  { id: '4', name: 'CBD Capsulas 500mg (30un)', sku: 'CBD-CAP-500', category: 'Capsulas', price: 18000, quantity: 25, minQuantity: 20, requiresPrescription: false, isActive: true },
  { id: '5', name: 'CBD Creme Topico 100ml', sku: 'CBD-CRM-100', category: 'Cremes', price: 12000, quantity: 40, minQuantity: 15, requiresPrescription: false, isActive: true },
  { id: '6', name: 'Full Spectrum Premium 6000mg', sku: 'CBD-FS-6000', category: 'Oleos', price: 78000, quantity: 0, minQuantity: 5, requiresPrescription: true, isActive: true },
  { id: '7', name: 'CBD Oil 1000mg Iniciante', sku: 'CBD-OIL-1000', category: 'Oleos', price: 15000, quantity: 50, minQuantity: 20, requiresPrescription: false, isActive: true },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesLowStock = !showLowStock || getProductStatus(product) !== 'active';
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter(p => getProductStatus(p) !== 'active').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie o estoque de produtos</p>
        </div>
        {lowStockCount > 0 && (
          <Badge variant="error" size="md">
            <Icon name="warning" size="sm" className="mr-1" />
            {lowStockCount} produtos com estoque baixo
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="input pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-full md:w-48"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Apenas estoque baixo</span>
          </label>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="inventory_2" size="xl" className="text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Preco</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Quantidade</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  return (
                    <tr
                      key={product.id}
                      className={clsx(
                        'hover:bg-gray-50 transition-colors',
                        status === 'out' && 'bg-error-50',
                        status === 'low' && 'bg-warning-50'
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon name="medication" className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                            {product.requiresPrescription && (
                              <span className="inline-flex items-center gap-1 mt-1 text-xs text-warning-600">
                                <Icon name="clinical_notes" size="sm" />
                                Receita
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx(
                          'inline-flex items-center justify-center w-12 h-8 rounded-lg font-semibold',
                          status === 'active' && 'bg-success-100 text-success-700',
                          status === 'low' && 'bg-warning-100 text-warning-700',
                          status === 'out' && 'bg-error-100 text-error-700'
                        )}>
                          {product.quantity}
                        </span>
                        {status !== 'active' && (
                          <p className="text-xs text-gray-500 mt-1">Min: {product.minQuantity}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={statusConfig[status].variant}>
                          <Icon name={statusConfig[status].icon} size="sm" className="mr-1" />
                          {statusConfig[status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon="add"
                            onClick={() => {
                              setSelectedProduct(product);
                              setAdjustQuantity(0);
                            }}
                          >
                            Ajustar
                          </Button>
                          <Button variant="ghost" size="sm" icon="edit" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ajustar Estoque</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Produto</p>
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-xs text-gray-500">Estoque atual: {selectedProduct.quantity}</p>
              </div>
              <div>
                <label className="label">Quantidade (+ para entrada, - para saida)</label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Motivo</label>
                <select className="input">
                  <option value="">Selecione...</option>
                  <option value="purchase">Compra</option>
                  <option value="return">Devolucao</option>
                  <option value="adjustment">Ajuste de inventario</option>
                  <option value="damage">Avaria</option>
                  <option value="expiry">Validade expirada</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" icon="save">
                  Salvar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
