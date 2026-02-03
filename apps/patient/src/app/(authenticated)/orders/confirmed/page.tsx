'use client';

import Link from 'next/link';

const orderDetails = {
  id: 'ORD-926',
  date: '31/01/2026',
  estimatedDelivery: '05 Fev - 07 Fev, 2026',
  products: [
    { name: 'Óleo de CBD Full Spectrum 3000mg', quantity: 1, price: 489, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
    { name: 'Creme Tópico CBD 500mg', quantity: 1, price: 155.9, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop' },
  ],
  address: {
    name: 'Maria Silva Santos',
    street: 'Av. Paulista, 1000 - Apto 121',
    neighborhood: 'Bela Vista',
    city: 'São Paulo - SP',
    zipCode: '01310-100',
  },
  payment: {
    method: 'Cartão de Crédito',
    lastDigits: '4242',
    installments: '3x de R$ 222,30',
  },
  subtotal: 644.9,
  shipping: 22,
  total: 666.9,
};

export default function OrderConfirmedPage() {
  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 border-2 border-green-500 text-green-500">
            <span className="material-symbols-outlined text-5xl">check</span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Pedido Realizado com Sucesso!</h1>
          <p className="text-slate-500 mt-2">Enviamos um comprovante para o seu e-mail.</p>
        </div>
      </div>

      {/* Order Number Card */}
      <div className="w-full max-w-2xl bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">Número do Pedido</p>
            <p className="text-2xl font-black">#{orderDetails.id}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-white/80 text-sm">Previsão de Entrega</p>
            <p className="text-lg font-bold">{orderDetails.estimatedDelivery}</p>
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Products */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shopping_bag</span>
            Produtos do Pedido
          </h3>
          <div className="space-y-3">
            {orderDetails.products.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-sm text-slate-500">Qtd: {product.quantity}</p>
                </div>
                <p className="font-bold text-slate-900">R$ {product.price.toFixed(2).replace('.', ',')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            Endereço de Entrega
          </h3>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="font-medium text-slate-900">{orderDetails.address.name}</p>
            <p className="text-sm text-slate-600">{orderDetails.address.street}</p>
            <p className="text-sm text-slate-600">{orderDetails.address.neighborhood}, {orderDetails.address.city}</p>
            <p className="text-sm text-slate-600">CEP: {orderDetails.address.zipCode}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">credit_card</span>
            Forma de Pagamento
          </h3>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
            <div className="flex items-center justify-center size-12 rounded-lg bg-white border border-slate-200">
              <span className="material-symbols-outlined text-slate-600">credit_card</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">{orderDetails.payment.method}</p>
              <p className="text-sm text-slate-500">Final {orderDetails.payment.lastDigits} • {orderDetails.payment.installments}</p>
            </div>
          </div>
        </div>

        {/* Order Totals */}
        <div className="p-6 bg-slate-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">R$ {orderDetails.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Frete</span>
              <span className="font-medium text-slate-900">R$ {orderDetails.shipping.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-primary">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="w-full max-w-2xl p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600">info</span>
          <div>
            <p className="font-bold text-blue-800 text-sm">Acompanhe seu pedido</p>
            <p className="text-sm text-blue-600 mt-1">
              Você receberá atualizações por e-mail sobre o status da sua entrega. Também pode acompanhar em tempo real clicando no botão abaixo.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
        <Link
          href={`/orders/${orderDetails.id}/tracking`}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">local_shipping</span>
          Rastrear Pedido
        </Link>
        <Link
          href="/marketplace"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-medium transition-colors"
        >
          <span className="material-symbols-outlined">storefront</span>
          Continuar Comprando
        </Link>
      </div>

      {/* Secondary Link */}
      <Link
        href="/orders"
        className="mt-6 text-primary hover:text-primary/80 font-medium flex items-center gap-2"
      >
        <span className="material-symbols-outlined">list_alt</span>
        Ver Meus Pedidos
      </Link>

      {/* Support */}
      <div className="text-center mt-8">
        <p className="text-slate-500 text-sm">
          Precisa de ajuda?{' '}
          <Link href="/support" className="text-primary hover:underline font-medium">
            Entre em contato com o suporte
          </Link>
        </p>
      </div>
    </div>
  );
}
