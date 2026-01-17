'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  Shield,
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  CreditCard,
  FileText,
  Settings,
  Activity,
  BarChart3,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Medicos',
    href: '/super-admin/doctors',
    icon: Stethoscope,
  },
  {
    name: 'Organizacoes',
    href: '/super-admin/organizations',
    icon: Building2,
  },
  {
    name: 'Pacientes',
    href: '/super-admin/patients',
    icon: Users,
  },
  {
    name: 'Assinaturas',
    href: '/super-admin/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Relatorios',
    href: '/super-admin/reports',
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    name: 'Logs de Auditoria',
    href: '/super-admin/audit-logs',
    icon: FileText,
  },
  {
    name: 'Monitoramento',
    href: '/super-admin/monitoring',
    icon: Activity,
  },
  {
    name: 'Configuracoes',
    href: '/super-admin/settings',
    icon: Settings,
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-700">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">CANNEO</span>
            <p className="text-xs text-purple-400">Super Admin</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-purple-300 font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Administrador
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-700">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sistema
            </p>
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* System Status */}
        <div className="p-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-white">Sistema Online</p>
            </div>
            <p className="text-xs text-gray-400">Todos os servicos operacionais</p>
          </div>
        </div>
      </div>
    </div>
  );
}
