'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = ['Todos', 'Óleos', 'Cápsulas', 'Cremes', 'Flores', 'Acessórios'];

const products = [
  {
    id: '1',
    name: 'Óleo CBD Full Spectrum 3000mg',
    category: 'Óleos',
    concentration: '3000mg CBD',
    price: 389.9,
    originalPrice: 450,
    pharmacy: 'PharmaLife',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
    requiresPrescription: true,
    inStock: true,
  },
  {
    id: '2',
    name: 'Cápsulas CBD 25mg - 60 unidades',
    category: 'Cápsulas',
    concentration: '1500mg CBD',
    price: 299.9,
    originalPrice: null,
    pharmacy: 'Drogaria Saúde+',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop',
    requiresPrescription: true,
    inStock: true,
  },
  {
    id: '3',
    name: 'Creme Tópico CBD 500mg',
    category: 'Cremes',
    concentration: '500mg CBD',
    price: 155.9,
    originalPrice: 189.9,
    pharmacy: 'Farmácia Viva Bem',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop',
    requiresPrescription: false,
    inStock: true,
  },
  {
    id: '4',
    name: 'Óleo CBD Broad Spectrum 1000mg',
    category: 'Óleos',
    concentration: '1000mg CBD',
    price: 249.9,
    originalPrice: null,
    pharmacy: 'PharmaLife',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop',
    requiresPrescription: true,
    inStock: true,
  },
  {
    id: '5',
    name: 'Óleo CBD + CBN Sleep 2000mg',
    category: 'Óleos',
    concentration: '2000mg CBD',
    price: 420,
    originalPrice: 499.9,
    pharmacy: 'Drogaria Saúde+',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
    requiresPrescription: true,
    inStock: false,
  },
  {
    id: '6',
    name: 'Cápsulas CBD + Melatonina 30un',
    category: 'Cápsulas',
    concentration: '750mg CBD',
    price: 189.9,
    originalPrice: null,
    pharmacy: 'Farmácia Viva Bem',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop',
    requiresPrescription: false,
    inStock: true,
  },
];

const pharmacies = [
  { id: 1, name: 'PharmaLife Centro', distance: '1.2 km', delivery: 'Entrega em 2h', type: 'fast' },
  { id: 2, name: 'Drogaria Saúde+', distance: '2.5 km', delivery: 'Entrega hoje', type: 'standard' },
  { id: 3, name: 'Farmácia Viva Bem', distance: '3.0 km', delivery: 'Entrega amanhã', type: 'scheduled' },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.concentration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Marketplace CANNEO</h1>
          <p className="text-slate-300 mb-6 max-w-xl">
            Encontre farmácias parceiras e receba seus medicamentos com agilidade. Digite seu CEP para começar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                location_on
              </span>
              <input
                type="text"
                placeholder="Digite seu CEP (ex: 01000-000)"
                className="w-full h-12 pl-10 pr-4 rounded-lg border-0 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors">
              Buscar
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      {/* Promo Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600 text-2xl">local_shipping</span>
          <div>
            <p className="font-bold text-green-800">Frete Grátis</p>
            <p className="text-sm text-green-600">Na primeira compra acima de R$ 300,00</p>
          </div>
        </div>
        <button className="text-sm font-bold text-green-700 hover:underline">Ver Regras</button>
      </div>

      {/* Prescription Products Alert */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <span className="material-symbols-outlined text-primary text-2xl">description</span>
        <div className="flex-1">
          <p className="font-bold text-slate-900">Produtos da sua Receita</p>
          <p className="text-sm text-slate-600">Você tem uma receita ativa. Veja os produtos prescritos.</p>
        </div>
        <Link
          href="/marketplace/prescription"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          Ver Receita
        </Link>
      </div>

      {/* Nearby Pharmacies */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Farmácias Próximas</h2>
          <button className="text-sm font-medium text-primary hover:underline">Ver todas</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">{pharmacy.name}</h3>
                <p className="text-xs text-slate-500">{pharmacy.distance} • {pharmacy.delivery}</p>
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    pharmacy.type === 'fast'
                      ? 'bg-green-50 text-green-600'
                      : pharmacy.type === 'standard'
                      ? 'bg-slate-50 text-slate-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {pharmacy.type === 'fast' ? 'bolt' : pharmacy.type === 'standard' ? 'local_shipping' : 'schedule'}
                  </span>
                  {pharmacy.type === 'fast' ? 'Rápida' : pharmacy.type === 'standard' ? 'Padrão' : 'Agendada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar medicamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Destaques da Região</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 border-0 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-0 cursor-pointer"
          >
            <option value="relevance">Relevância</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 backdrop-blur text-xs font-medium text-slate-700 shadow-sm">
                  <span className="size-1.5 rounded-full bg-green-500"></span>
                  {product.pharmacy}
                </span>
              </div>
              {product.requiresPrescription && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">description</span>
                    Receita
                  </span>
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-sm font-bold">
                    Esgotado
                  </span>
                </div>
              )}
              <button className="absolute bottom-3 right-3 flex items-center justify-center size-10 rounded-full bg-white text-slate-400 shadow-sm hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <div className="mb-2">
                <p className="text-xs text-primary font-medium mb-1">{product.concentration}</p>
                <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
              </div>
              <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                <div>
                  {product.originalPrice && (
                    <p className="text-xs text-slate-400 line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <p className="text-lg font-black text-slate-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <button
                  disabled={!product.inStock}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  Adicionar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum produto encontrado</h3>
          <p className="text-slate-500 text-sm">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  );
}
