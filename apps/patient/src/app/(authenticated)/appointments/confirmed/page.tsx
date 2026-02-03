'use client';

import Link from 'next/link';

export default function ConfirmedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* Success Hero */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 border-2 border-green-500 text-green-500">
            <span className="material-symbols-outlined text-5xl font-bold">check</span>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pagamento Aprovado!</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Sua consulta foi agendada com sucesso. Enviamos um comprovante para o seu e-mail.
          </p>
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="w-full max-w-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="relative h-32 bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=400&fit=crop")`,
            }}
          />
        </div>

        {/* Card Body */}
        <div className="px-8 pb-8 -mt-12 relative z-20">
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 flex-shrink-0 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
                alt="Dra. Ana Beatriz"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-center sm:text-left pt-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mb-2">
                Confirmado
              </span>
              <h3 className="text-xl font-bold text-slate-900">Dra. Ana Beatriz Santos</h3>
              <p className="text-sm text-slate-500 mb-4">Neurologista</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  <span className="font-medium text-sm">31 de Janeiro, 2026</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="font-medium text-sm">14:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location snippet */}
          <div className="mt-6 flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 mt-0.5">videocam</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Teleconsulta</p>
              <p className="text-xs text-slate-500">
                O link para a sala de vídeo será enviado por e-mail e estará disponível 15 minutos antes da consulta.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Instruções para o dia da consulta
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Esteja em um ambiente silencioso e bem iluminado</li>
              <li>• Tenha uma conexão estável de internet</li>
              <li>• Prepare documentos e exames relevantes</li>
              <li>• Entre na sala 5 minutos antes do horário</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col w-full gap-3 sm:flex-row justify-center max-w-[480px]">
        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 h-12 px-6 text-white text-base font-bold transition-all shadow-sm hover:shadow-md">
          <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
          <span>Adicionar ao Calendário</span>
        </button>
        <Link
          href="/appointments"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 h-12 px-6 text-slate-900 text-base font-medium transition-all"
        >
          <span>Ver Minhas Consultas</span>
        </Link>
      </div>

      {/* Back to Home */}
      <Link href="/dashboard" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar ao Início
      </Link>

      {/* Support */}
      <div className="text-center mt-4">
        <p className="text-slate-500 text-sm">
          Precisa de ajuda?{' '}
          <Link href="/support" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
            Entre em contato com o suporte
          </Link>
        </p>
      </div>
    </div>
  );
}
