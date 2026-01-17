'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  Leaf,
  LayoutDashboard,
  Calendar,
  FileText,
  FolderOpen,
  User,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  {
    name: 'Inicio',
    href: '/patient-dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Minhas Consultas',
    href: '/my-consultations',
    icon: Calendar,
  },
  {
    name: 'Minhas Prescricoes',
    href: '/my-prescriptions',
    icon: FileText,
  },
  {
    name: 'Meus Documentos',
    href: '/my-documents',
    icon: FolderOpen,
  },
];

const secondaryNavigation = [
  {
    name: 'Meu Perfil',
    href: '/my-profile',
    icon: User,
  },
  {
    name: 'Ajuda',
    href: '/patient-help',
    icon: HelpCircle,
  },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Paciente
              </p>
              <p className="text-xs text-gray-500 truncate">
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
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Conta
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
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
