'use client';

import { useState } from 'react';
import Link from 'next/link';

const prescriptions = [
  {
    id: '1',
    date: '24 Jan, 2026',
    doctor: 'Dr. Ricardo Silva',
    doctorSpecialty: 'Clínica Geral',
    expiresAt: '24 Abr, 2026',
    status: 'valid',
    products: [
      { name: 'Óleo de CBD Full Spectrum 3000mg', dosage: '0,5ml via oral, 2x ao dia' },
      { name: 'Creme Tópico CBD 500mg', dosage: 'Aplicar na região lombar conforme necessidade' },
    ],
  },
  {
    id: '2',
    date: '10 Dez, 2025',
    doctor: 'Dra. Ana Beatriz Santos',
    doctorSpecialty: 'Neurologista',
    expiresAt: '10 Mar, 2026',
    status: 'used',
    products: [
      { name: 'Óleo de CBD Broad Spectrum 1000mg', dosage: '0,3ml via oral, 1x ao dia' },
    ],
  },
  {
    id: '3',
    date: '15 Set, 2025',
    doctor: 'Dr. Carlos Eduardo Lima',
    doctorSpecialty: 'Psiquiatra',
    expiresAt: '15 Dez, 2025',
    status: 'expired',
    products: [
      { name: 'Cápsulas CBD 25mg - 60 unidades', dosage: '1 cápsula, 2x ao dia' },
    ],
  },
];

const pharmacyOptions = [
  {
    id: 1,
    name: 'Farmácia Panvel',
    price: 489,
    delivery: '3-5 dias úteis',
    inStock: true,
  },
  {
    id: 2,
    name: 'Drogaria Saúde+',
    price: 510,
    delivery: '2-4 dias úteis',
    inStock: true,
  },
  {
    id: 3,
    name: 'Farmácia Viva Bem',
    price: 475,
    delivery: '5-7 dias úteis',
    inStock: false,
  },
];

export default function PrescriptionPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>('1');

  const activePrescription = prescriptions.find((p) => p.id === selectedPrescription);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Válida
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">inventory</span>
            Utilizada
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Expirada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 mb-4 text-sm">
          <Link href="/marketplace" className="text-primary hover:underline">Marketplace</Link>
          <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          <span className="text-slate-900">Compra via Receita</span>
        </nav>
        <h1 className="text-3xl font-black text-slate-900">Compra via Receita Digital</h1>
        <p className="text-slate-500 mt-1">
          Identificamos os produtos da sua receita nas farmácias parceiras
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Prescription Viewer */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Visualização da Receita Digital
              </span>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">zoom_in</span>
                </button>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">print</span>
                </button>
              </div>
            </div>

            {activePrescription && (
              <div className="p-8 bg-white max-h-[600px] overflow-y-auto">
                <div className="max-w-md mx-auto border border-slate-100 p-8 shadow-inner font-serif">
                  <div className="text-center mb-8 border-b pb-4">
                    <h3 className="font-bold text-lg uppercase tracking-widest text-primary">
                      {activePrescription.doctor}
                    </h3>
                    <p className="text-xs italic text-slate-500">
                      CRM: 12345-SP | {activePrescription.doctorSpecialty}
                    </p>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm mb-1">
                      <span className="font-bold">Paciente:</span> Maria Silva Santos
                    </p>
                    <p className="text-sm">
                      <span className="font-bold">Data:</span> {activePrescription.date}
                    </p>
                  </div>
                  <div className="my-10 space-y-6">
                    {activePrescription.products.map((product, index) => (
                      <div key={index} className={index === 0 ? 'p-2 bg-yellow-50 border-l-4 border-yellow-400' : ''}>
                        <p className="text-sm font-bold uppercase mb-1">Prescrição #{index + 1}</p>
                        <p className="text-base font-serif italic">{product.name}</p>
                        <p className="text-xs mt-2 text-slate-600">Posologia: {product.dosage}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-16 pt-10 border-t text-center">
                    <div className="w-32 h-16 mx-auto mb-2 opacity-30 border-b border-black" style={{ transform: 'rotate(-5deg)' }}></div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Assinado Digitalmente via ICP-Brasil
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Products and Pharmacies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Select Prescription */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Selecionar Receita
            </h2>
            <div className="space-y-3">
              {prescriptions.map((prescription) => (
                <label
                  key={prescription.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedPrescription === prescription.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 hover:border-slate-200'
                  } ${prescription.status !== 'valid' ? 'opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="prescription"
                    value={prescription.id}
                    checked={selectedPrescription === prescription.id}
                    onChange={(e) => setSelectedPrescription(e.target.value)}
                    disabled={prescription.status !== 'valid'}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{prescription.doctor}</p>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <p className="text-sm text-slate-500">
                      Emitida em {prescription.date} • Válida até {prescription.expiresAt}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {prescription.products.length} produto(s) prescrito(s)
                    </p>
                  </div>
                  <div
                    className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPrescription === prescription.id
                        ? 'border-primary bg-primary'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedPrescription === prescription.id && (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Prescribed Products */}
          {activePrescription && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">medication</span>
                  Produtos Prescritos Encontrados
                </h2>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  {activePrescription.products.length} itens correspondentes
                </span>
              </div>

              <div className="space-y-4">
                {activePrescription.products.map((product, index) => (
                  <div key={index} className="p-5 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex gap-6">
                      <div className="size-24 rounded-lg bg-slate-50 flex items-center justify-center p-2 shrink-0 border border-slate-100">
                        <img
                          src={index === 0 ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop' : 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop'}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Prescrição #{index + 1}
                        </span>
                        <h3 className="font-bold text-lg leading-snug mt-1">{product.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{product.dosage}</p>

                        {/* Pharmacy comparison */}
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-bold text-slate-500 uppercase">Comparar farmácias:</p>
                          {pharmacyOptions.map((pharmacy) => (
                            <div
                              key={pharmacy.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">storefront</span>
                                <div>
                                  <p className="font-medium text-slate-900 text-sm">{pharmacy.name}</p>
                                  <p className="text-xs text-slate-500">{pharmacy.delivery}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {!pharmacy.inStock && (
                                  <span className="text-xs text-red-500 font-medium">Indisponível</span>
                                )}
                                <p className="font-bold text-primary">
                                  R$ {pharmacy.price.toFixed(2).replace('.', ',')}
                                </p>
                                <button
                                  disabled={!pharmacy.inStock}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">safety_check</span>
              <h4 className="font-bold text-sm">Farmácias Certificadas</h4>
              <p className="text-xs text-slate-500 mt-1">Todos os parceiros são homologados pela ANVISA.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">lock</span>
              <h4 className="font-bold text-sm">Compra Segura</h4>
              <p className="text-xs text-slate-500 mt-1">Ambiente criptografado e dados protegidos pela LGPD.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">support_agent</span>
              <h4 className="font-bold text-sm">Suporte Canneo</h4>
              <p className="text-xs text-slate-500 mt-1">Dúvidas com seu pedido? Fale conosco a qualquer hora.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Summary */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white shadow-2xl rounded-2xl p-4 border border-slate-200 min-w-[280px]">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-500">Resumo do Carrinho</span>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">2 Itens</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">Total Estimado</span>
            <span className="text-xl font-bold text-primary">R$ 644,90</span>
          </div>
          <Link
            href="/marketplace/checkout"
            className="mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all"
          >
            Ir para o Checkout
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
