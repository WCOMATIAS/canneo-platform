'use client';

import { useState } from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Painel Geral' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    // Clear cookies and redirect
    document.cookie = 'canneo_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.canneo.com.br';
    document.cookie = 'canneo_refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.canneo.com.br';
    window.location.href = '/auth/login';
  }

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-text-muted">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg font-bold text-text-main dark:text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-96 border border-transparent focus-within:border-primary/50 transition-colors">
          <span className="material-symbols-outlined text-text-muted dark:text-slate-400 text-[20px]">search</span>
          <input
            className="bg-transparent border-none text-sm w-full ml-2 focus:ring-0 focus:outline-none text-text-main dark:text-white placeholder-text-muted dark:placeholder-slate-500"
            placeholder="Buscar por médico, paciente ou CPF..."
            type="text"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted dark:text-slate-400 transition-colors relative">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
          </button>
          <button className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
        </div>

        {/* Profile */}
        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-main dark:text-white leading-none">Admin Principal</p>
            <p className="text-xs text-primary mt-1 leading-none">Super Admin</p>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-primary rounded-full size-10 border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer flex items-center justify-center"
          >
            <span className="text-white font-bold">A</span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-text-main dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
