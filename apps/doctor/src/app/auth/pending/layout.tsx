'use client';

import Link from 'next/link';

export default function PendingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-xl">local_hospital</span>
          </div>
          <span className="text-lg font-bold text-slate-900">CANNEO</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-slate-600 hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sair
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
              <span>Ambiente Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-blue-500">verified_user</span>
              <span>LGPD Compliance</span>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">
              Suporte
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Ajuda
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
