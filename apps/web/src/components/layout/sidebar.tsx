'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  Leaf,
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  FileText,
  FileCheck,
  Building2,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pacientes',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Agenda',
    href: '/schedule',
    icon: Calendar,
  },
  {
    name: 'Consultas',
    href: '/consultations',
    icon: Video,
  },
  {
    name: 'Prontuarios',
    href: '/medical-records',
    icon: FileText,
  },
  {
    name: 'Laudos ANVISA',
    href: '/anvisa-reports',
    icon: FileCheck,
  },
];

const secondaryNavigation = [
  {
    name: 'Organizacao',
    href: '/organization',
    icon: Building2,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    name: 'Configuracoes',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Ajuda',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { membership, doctorProfile } = useAuthStore();

  const filteredSecondary = secondaryNavigation.filter((item) => {
    if (item.roles) {
      return item.roles.includes(membership?.role || '');
    }
    return true;
  });

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-canneo-600 rounded-xl flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-canneo-800">CANNEO</span>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-canneo-100 rounded-full flex items-center justify-center">
              <span className="text-canneo-700 font-semibold text-sm">
                {doctorProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doctorProfile?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                CRM {doctorProfile?.crm}-{doctorProfile?.ufCrm}
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
                    ? 'bg-canneo-50 text-canneo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-canneo-600' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Configuracoes
            </p>
            {filteredSecondary.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-canneo-50 text-canneo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-canneo-600' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Trial Banner */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-canneo-500 to-canneo-600 rounded-lg p-4 text-white">
            <p className="text-sm font-medium">Trial Gratuito</p>
            <p className="text-xs opacity-90 mt-1">7 dias restantes</p>
            <Link
              href="/billing"
              className="mt-3 block w-full text-center bg-white text-canneo-600 text-sm font-medium py-2 rounded-md hover:bg-canneo-50 transition-colors"
            >
              Fazer Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
