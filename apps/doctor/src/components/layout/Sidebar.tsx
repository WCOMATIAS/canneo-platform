'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Agenda', href: '/agenda', icon: 'calendar_month' },
  { label: 'Pacientes', href: '/patients', icon: 'group' },
  { label: 'Prescrições', href: '/prescriptions', icon: 'clinical_notes' },
  { label: 'Saques', href: '/withdrawals', icon: 'account_balance_wallet' },
  { label: 'Contas Bancárias', href: '/bank-accounts', icon: 'account_balance' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
            <Icon name="medical_services" size="sm" className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CANNEO</span>
          <span className="text-xs px-2 py-0.5 bg-secondary-500 text-white rounded-full">
            Médico
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                name={item.icon}
                size="md"
                filled={isActive}
                className={isActive ? 'text-primary-500' : ''}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Icon name="settings" />
          <span className="font-medium">Configurações</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all">
          <Icon name="logout" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
