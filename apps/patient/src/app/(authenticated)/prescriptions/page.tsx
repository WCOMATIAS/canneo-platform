'use client';

import { useState } from 'react';
import Link from 'next/link';

const prescriptions = [
  {
    id: '1',
    code: 'REC-2026-001',
    doctor: 'Dr. André Gomes',
    doctorCrm: 'CRM/SP 123456',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialty: 'Neurologista',
    issuedAt: '24 Jan, 2026',
    expiresAt: '24 Abr, 2026',
    products: ['Cannabidiol Full Spectrum 3000mg', 'Creme Tópico CBD 500mg'],
    status: 'active',
    daysLeft: 84,
  },
  {
    id: '2',
    code: 'REC-2025-089',
    doctor: 'Dra. Ana Beatriz Santos',
    doctorCrm: 'CRM/SP 789012',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    specialty: 'Psiquiatra',
    issuedAt: '10 Dez, 2025',
    expiresAt: '10 Mar, 2026',
    products: ['Óleo CBD Broad Spectrum 1000mg'],
    status: 'expiring',
    daysLeft: 7,
  },
  {
    id: '3',
    code: 'REC-2025-076',
    doctor: 'Dr. Carlos Mendes',
    doctorCrm: 'CRM/SP 456789',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialty: 'Neurologista',
    issuedAt: '15 Set, 2025',
    expiresAt: '15 Dez, 2025',
    products: ['Cápsulas CBD 25mg - 60 unidades'],
    status: 'expired',
    daysLeft: 0,
  },
  {
    id: '4',
    code: 'REC-2025-045',
    doctor: 'Dra. Maria Helena Souza',
    doctorCrm: 'CRM/MG 123456',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    specialty: 'Psiquiatra',
    issuedAt: '10 Jun, 2025',
    expiresAt: '10 Set, 2025',
    products: ['Óleo CBD + CBN Sleep 2000mg'],
    status: 'expired',
    daysLeft: 0,
  },
];

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string, daysLeft: number) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Ativa
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            <span className="material-symbols-outlined text-sm">warning</span>
            Expira em {daysLeft} dias
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Expirada
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && (rx.status === 'active' || rx.status === 'expiring')) ||
      (activeTab === 'expired' && rx.status === 'expired');
    const matchesSearch =
      rx.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Minhas Receitas</h1>
          <p className="text-slate-500 mt-1">Gerencie suas prescrições médicas e solicite renovações.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/prescriptions/renew"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-xl">autorenew</span>
            Renovar Receita
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Ativas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {prescriptions.filter((rx) => rx.status === 'active' || rx.status === 'expiring').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'expired'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Expiradas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            {prescriptions.filter((rx) => rx.status === 'expired').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Todas
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {prescriptions.length}
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código, médico ou medicamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select className="h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option>Todos os períodos</option>
          <option>Últimos 3 meses</option>
          <option>Últimos 6 meses</option>
          <option>Último ano</option>
        </select>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Doctor Info */}
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={prescription.doctorAvatar}
                  alt={prescription.doctor}
                  className="size-14 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">{prescription.doctor}</p>
                    {getStatusBadge(prescription.status, prescription.daysLeft)}
                  </div>
                  <p className="text-sm text-slate-500">{prescription.specialty} • {prescription.doctorCrm}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Código: {prescription.code}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Emitida</p>
                  <p className="font-medium text-slate-900">{prescription.issuedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Validade</p>
                  <p className={`font-medium ${prescription.status === 'expired' ? 'text-red-600' : 'text-slate-900'}`}>
                    {prescription.expiresAt}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center size-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
                <button className="flex items-center justify-center size-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-xl">download</span>
                </button>
                {(prescription.status === 'active' || prescription.status === 'expiring') && (
                  <>
                    <Link
                      href="/marketplace/prescription"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_cart</span>
                      Comprar
                    </Link>
                  </>
                )}
                {prescription.status === 'expiring' && (
                  <Link
                    href="/prescriptions/renew"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">autorenew</span>
                    Renovar
                  </Link>
                )}
                {prescription.status === 'expired' && (
                  <Link
                    href="/prescriptions/renew"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">autorenew</span>
                    Solicitar Nova
                  </Link>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase mb-2">Produtos prescritos</p>
              <div className="flex flex-wrap gap-2">
                {prescription.products.map((product, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPrescriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">description</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma receita encontrada</h3>
          <p className="text-slate-500 text-sm">Tente ajustar os filtros ou termo de busca</p>
        </div>
      )}
    </div>
  );
}
