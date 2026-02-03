'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900">
            Olá, Maria!
          </h1>
          <p className="text-slate-500 text-base">
            Gerencie sua jornada de tratamento e acompanhe seu progresso.
          </p>
        </div>
        <Link
          href="/appointments/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Agendar Nova Consulta</span>
        </Link>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <p className="text-slate-500 text-sm font-medium">Status da Receita</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">Ativa</p>
          <p className="text-xs text-slate-400 mt-1">Válida até 15 Mar, 2026</p>
        </div>

        <div className="flex flex-col gap-1 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">medication</span>
            <p className="text-slate-500 text-sm font-medium">Renovação de Receita</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">Disponível</p>
          <p className="text-xs text-slate-400 mt-1">Última renovação: 20 dias atrás</p>
        </div>

        <div className="flex flex-col gap-1 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-orange-500">pending_actions</span>
            <p className="text-slate-500 text-sm font-medium">Ações Pendentes</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">1 Formulário</p>
          <p className="text-xs text-slate-400 mt-1">Pesquisa de acompanhamento</p>
        </div>

        <div className="flex flex-col gap-1 p-5 rounded-xl bg-purple-50 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-purple-600">loyalty</span>
              <p className="text-purple-800 text-sm font-medium">Pontos</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">450 Pts</p>
            <Link href="/rewards" className="text-xs text-purple-700 font-semibold mt-1 inline-block hover:underline">
              Resgatar descontos →
            </Link>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] text-purple-200 opacity-50 z-0">
            eco
          </span>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Next Appointment */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Próxima Consulta</h3>
            <div className="flex flex-col md:flex-row items-stretch justify-between rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col justify-center gap-4 p-6 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Começando em 15 min
                </div>
                <div className="flex flex-col">
                  <p className="text-slate-900 text-xl font-bold leading-tight">
                    Consulta com Dra. Ana Beatriz
                  </p>
                  <p className="text-slate-500 text-sm font-normal leading-normal mt-1">
                    31 Jan, 14:00 • Videoconsulta
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Link
                    href="/consultation/123"
                    className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                    <span>Entrar na Sala</span>
                  </Link>
                  <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors">
                    Reagendar
                  </button>
                </div>
              </div>
              <div
                className="w-full md:w-1/3 min-h-[160px] bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `url("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop")`,
                }}
              />
            </div>
          </div>

          {/* Recent History */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Histórico Recente</h3>
              <Link href="/appointments" className="text-sm font-semibold text-primary hover:text-primary/80">
                Ver Tudo
              </Link>
            </div>
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center flex-none">
                  <span className="material-symbols-outlined text-green-600">shopping_bag</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Pedido #4921 - Óleo CBD Full Spectrum</p>
                  <p className="text-xs text-slate-500">28 Jan, 2026</p>
                </div>
                <div className="hidden sm:flex px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                  Entregue
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center flex-none">
                  <span className="material-symbols-outlined text-primary">medical_services</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Consulta de Acompanhamento</p>
                  <p className="text-xs text-slate-500">20 Jan, 2026</p>
                </div>
                <div className="hidden sm:flex px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                  Concluída
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center flex-none">
                  <span className="material-symbols-outlined text-purple-600">description</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Receita Digital - CBD 20mg/ml</p>
                  <p className="text-xs text-slate-500">20 Jan, 2026</p>
                </div>
                <div className="hidden sm:flex px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
                  Pronto
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/prescriptions/renew"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="size-10 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">autorenew</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 text-center">Renovar Receita</span>
              </Link>

              <Link
                href="/marketplace"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="size-10 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 text-center">Marketplace</span>
              </Link>

              <Link
                href="/support"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="size-10 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 text-center">Suporte</span>
              </Link>

              <Link
                href="/faq"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="size-10 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 text-center">FAQ</span>
              </Link>
            </div>
          </div>

          {/* Featured Product */}
          <Link
            href="/marketplace/product/1"
            className="rounded-xl overflow-hidden relative min-h-[240px] flex items-end p-6 bg-cover bg-center group cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop")`,
            }}
          >
            <div className="relative z-10 w-full">
              <span className="inline-block px-2 py-1 bg-primary text-white text-[10px] font-bold rounded mb-2 uppercase tracking-wide">
                Novidade
              </span>
              <h4 className="text-white font-bold text-lg leading-tight mb-1">Óleo Noturno Rest & Relax</h4>
              <p className="text-slate-200 text-xs mb-3">Fórmula rica em CBD para um sono melhor.</p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Comprar Agora <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Medications in Use */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Medicamentos em Uso</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200">
                <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">water_drop</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">CBD Full Spectrum 20mg/ml</p>
                  <p className="text-xs text-slate-500">10 gotas • 2x ao dia</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200">
                <div className="size-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600">capsule</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">CBN Sleep 5mg</p>
                  <p className="text-xs text-slate-500">1 cápsula • antes de dormir</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
