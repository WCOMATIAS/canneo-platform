'use client';

import Link from 'next/link';

const activePrescriptions = [
  {
    id: '1',
    code: 'REC-2026-001',
    doctor: 'Dr. André Gomes',
    doctorCrm: 'CRM/SP 123456',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    issuedAt: '24 Jan, 2026',
    expiresAt: 'AGO/2026',
    products: ['Cannabidiol Full Spectrum 3000mg', 'Creme Tópico CBD 500mg'],
    status: 'active',
  },
  {
    id: '2',
    code: 'REC-2025-089',
    doctor: 'Dra. Ana Beatriz Santos',
    doctorCrm: 'CRM/SP 789012',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    issuedAt: '10 Dez, 2025',
    expiresAt: 'MAR/2026',
    products: ['Óleo CBD Broad Spectrum 1000mg'],
    status: 'expiring',
  },
];

const documents = [
  { id: 1, name: 'Laudo Médico - Neurologia', type: 'laudo', date: '24 Jan, 2026', size: '1.2 MB' },
  { id: 2, name: 'Atestado Médico', type: 'atestado', date: '20 Jan, 2026', size: '450 KB' },
  { id: 3, name: 'Exame de Sangue', type: 'exame', date: '15 Jan, 2026', size: '2.1 MB' },
];

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Carteira Digital</h1>
          <p className="text-slate-500 mt-1">Documento oficial para comprovação legal do seu tratamento.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 text-sm font-medium">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Status: Ativo
        </div>
      </div>

      {/* Digital Card */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-full max-w-[640px] aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-emerald-400"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/30 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
            {/* Top */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <span className="font-bold text-lg tracking-wide">CANNEO</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-white/70 font-medium mb-1">Carteira do Paciente</p>
                <p className="font-mono text-white/90 font-semibold tracking-wider">MED-Cannabis</p>
              </div>
            </div>

            {/* Middle */}
            <div className="flex items-center gap-6 mt-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-slate-200 overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
                  alt="Paciente"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div>
                  <p className="text-xs uppercase text-white/60 font-medium">Nome do Paciente</p>
                  <h3 className="text-xl font-bold text-white truncate leading-tight">Maria Silva Santos</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <div>
                    <p className="text-xs uppercase text-white/60 font-medium">CPF</p>
                    <p className="text-sm font-mono text-white/90">***.456.789-**</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/60 font-medium">Nascimento</p>
                    <p className="text-sm font-mono text-white/90">12/05/1985</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-lg">
                <span className="material-symbols-outlined text-slate-900 text-6xl">qr_code_2</span>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-auto pt-6 border-t border-white/20 flex justify-between items-end">
              <div>
                <p className="text-xs uppercase text-white/60 font-medium mb-0.5">Médico Prescritor</p>
                <p className="font-semibold text-white">Dr. André Gomes</p>
                <p className="text-xs text-white/70">CRM/SP 123456</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-white/60 font-medium mb-0.5">Validade</p>
                <p className="font-semibold text-white">AGO/2026</p>
                <p className="text-xs text-white/50 mt-1 font-mono tracking-wider">ID: 882910-CN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 font-medium shadow-sm transition-all">
            <span className="material-symbols-outlined text-xl">download</span>
            Baixar PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-medium shadow-md transition-all">
            <span className="material-symbols-outlined text-xl">wallet</span>
            Adicionar à Carteira
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 font-medium shadow-sm transition-all">
            <span className="material-symbols-outlined text-xl">share</span>
            Compartilhar
          </button>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ANVISA Authorization */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <h3 className="font-bold text-slate-900">Autorização ANVISA</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Protocolo</span>
                <span className="font-mono font-medium text-slate-900">ANV-2024/9910</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Autorizado
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vencimento</span>
                <span className="font-medium text-slate-900">14/08/2026</span>
              </div>
            </div>
            <button className="mt-4 w-full py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
              Visualizar Documento
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h3 className="font-bold text-slate-900">Resumo do Tratamento</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-black text-primary">2</p>
              <p className="text-xs text-slate-500">Receitas Ativas</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-black text-slate-900">12</p>
              <p className="text-xs text-slate-500">Consultas Realizadas</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-black text-slate-900">8</p>
              <p className="text-xs text-slate-500">Meses de Tratamento</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-black text-green-600">87%</p>
              <p className="text-xs text-slate-500">Aderência</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Prescriptions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Receitas Ativas</h2>
          <Link href="/prescriptions" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4">
          {activePrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={prescription.doctorAvatar}
                    alt={prescription.doctor}
                    className="size-14 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{prescription.doctor}</p>
                      {prescription.status === 'expiring' && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                          Expirando
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{prescription.doctorCrm}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Emitida em {prescription.issuedAt} • Válida até {prescription.expiresAt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <div className="flex flex-wrap gap-1">
                    {prescription.products.map((product, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/prescriptions/${prescription.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      Ver
                    </Link>
                    <Link
                      href="/marketplace/prescription"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_cart</span>
                      Comprar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Documentos Salvos</h2>
          <Link href="/exams" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center size-10 rounded-lg ${
                    doc.type === 'laudo' ? 'bg-blue-100 text-blue-600' :
                    doc.type === 'atestado' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <span className="material-symbols-outlined">
                      {doc.type === 'laudo' ? 'description' : doc.type === 'atestado' ? 'verified' : 'biotech'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.date} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
