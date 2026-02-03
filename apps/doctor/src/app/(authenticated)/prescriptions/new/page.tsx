'use client';

import { useState } from 'react';
import Link from 'next/link';

const patientInfo = {
  name: 'João Santos',
  birthDate: '12/05/1980',
  age: 44,
  cpf: '***.456.789-**',
};

export default function NewPrescriptionPage() {
  const [product, setProduct] = useState('Extrato de Cannabis Sativa Full Spectrum 30ml');
  const [thc, setThc] = useState('0.3');
  const [cbd, setCbd] = useState('10.0');
  const [dosage, setDosage] = useState(
    'Iniciar com 5 gotas a cada 8 horas. Aumentar 1 gota por dose a cada 3 dias até atingir o efeito terapêutico desejado ou surgirem efeitos colaterais. Ingerir após refeições ricas em lipídios.'
  );
  const [quantity, setQuantity] = useState(2);
  const [unit, setUnit] = useState('Frascos');

  return (
    <div className="flex-1 w-full max-w-[1280px] mx-auto p-4 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">home</span> Home
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/patients" className="text-slate-500 hover:text-primary transition-colors">
          Pacientes
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/patients/1" className="text-slate-500 hover:text-primary transition-colors">
          {patientInfo.name}
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Prescrição Digital</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Prescrição Digital</h1>
          <p className="text-slate-500 text-base">Preencha os detalhes abaixo para emitir o documento.</p>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:flex items-center gap-2 text-slate-600 font-medium hover:text-primary transition-colors px-3 py-2">
            <span className="material-symbols-outlined">history</span>
            Histórico
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Section */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span> Paciente Selecionado
              </h3>
              <button className="text-primary text-sm font-medium hover:underline">Alterar</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Nome Completo</p>
                <p className="text-slate-900 font-medium">{patientInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Data de Nascimento</p>
                <p className="text-slate-900 font-medium">
                  {patientInfo.birthDate} ({patientInfo.age} anos)
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">CPF</p>
                <p className="text-slate-900 font-medium">{patientInfo.cpf}</p>
              </div>
            </div>
          </section>

          {/* Medication Details */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">medication</span>
                Detalhes da Medicação
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <span className="size-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                Receita Controlada
              </span>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Produto</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined">search</span>
                  </span>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                    placeholder="Busque por nome comercial ou princípio ativo..."
                  />
                </div>
              </div>

              {/* THC / CBD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">THC (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thc}
                      onChange={(e) => setThc(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0.0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium">%</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Acima de 0.2% requer receita amarela.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">CBD (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cbd}
                      onChange={(e) => setCbd(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0.0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium">%</span>
                  </div>
                </div>
              </div>

              {/* Dosage */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Posologia</label>
                  <button className="text-primary text-xs font-bold hover:underline">
                    Inserir Modelo Padrão
                  </button>
                </div>
                <textarea
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-y"
                  placeholder="Descreva detalhadamente como o paciente deve utilizar o medicamento..."
                />
              </div>

              {/* Quantity / Unit */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Quantidade</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 border border-r-0 border-slate-300 rounded-l-md bg-slate-50 hover:bg-slate-100 text-slate-600"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full text-center py-2.5 border-y border-slate-300 bg-white text-sm focus:ring-0 focus:border-slate-300"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 border border-l-0 border-slate-300 rounded-r-md bg-slate-50 hover:bg-slate-100 text-slate-600"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option>Frascos</option>
                    <option>Caixas</option>
                    <option>Gramas</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <button className="w-full sm:w-auto px-6 py-2.5 rounded-md text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
                  Salvar Rascunho
                </button>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors bg-white">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    Gerar PDF
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Assinar com ICP-Brasil
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Document Status */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
              Status do Documento
            </h3>
            <div className="relative pl-2">
              {/* Step 1 - Active */}
              <div className="relative flex gap-4 pb-8">
                <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
                    <span className="material-symbols-outlined text-[16px]">edit_document</span>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-primary">Rascunho</p>
                  <p className="text-xs text-slate-500 mt-0.5">Criado em 24/05 às 10:00</p>
                </div>
              </div>
              {/* Step 2 - Pending */}
              <div className="relative flex gap-4 pb-8">
                <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">draw</span>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-semibold text-slate-500">Assinada</p>
                  <p className="text-xs text-slate-400 mt-0.5">Aguardando certificado</p>
                </div>
              </div>
              {/* Step 3 - Pending */}
              <div className="relative flex gap-4">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-semibold text-slate-500">Registrada</p>
                  <p className="text-xs text-slate-400 mt-0.5">Pendente de emissão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
            <div className="flex gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">security</span>
              <h4 className="font-bold text-slate-900 text-sm">Segurança Jurídica</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 mb-3">
              Todas as prescrições emitidas pelo CANNEO seguem os padrões da RDC 660/2022 e Lei
              13.989/2020 de Telemedicina.
            </p>
            <a className="text-xs font-bold text-primary hover:underline" href="#">
              Ler diretrizes completas →
            </a>
          </div>

          {/* Suggested Product */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/30 text-6xl">medication_liquid</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Produto Sugerido</p>
              <p className="text-sm font-medium text-slate-900 line-clamp-2">
                Extrato de Cannabis Sativa Full Spectrum 30ml
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                  THC 0.3%
                </span>
                <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                  CBD 10%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
