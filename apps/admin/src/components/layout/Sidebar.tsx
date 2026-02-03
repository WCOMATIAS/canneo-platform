'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Painel' },
  { href: '/doctors', icon: 'medical_services', label: 'Médicos' },
  { href: '/users', icon: 'group', label: 'Pacientes' },
  { href: '/appointments', icon: 'calendar_month', label: 'Consultas' },
  { href: '/ledger', icon: 'attach_money', label: 'Financeiro' },
  { href: '/pharmacies', icon: 'local_pharmacy', label: 'Farmácias' },
  { href: '/audit-logs', icon: 'fact_check', label: 'Auditoria' },
];

const bottomItems = [
  { href: '/withdrawals', icon: 'account_balance_wallet', label: 'Saques' },
  { href: '/settings', icon: 'settings', label: 'Configurações' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex-shrink-0 transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-full size-10 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-main dark:text-white text-lg font-bold leading-none tracking-tight">CANNEO</h1>
            <p className="text-primary text-xs font-semibold uppercase tracking-wider mt-1">Administrativo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-text-main dark:hover:text-slate-200'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive(item.href) ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </Link>
        ))}

        {/* Divider */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-text-main dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
            v1.0
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-medium text-text-muted dark:text-slate-400">Versão do Sistema</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Atualizado hoje</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
