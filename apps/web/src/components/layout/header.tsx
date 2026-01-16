'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Menu,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Leaf,
} from 'lucide-react';

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout, logoutLoading } = useAuth();
  const { doctorProfile, membership } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden -ml-2 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-canneo-600 rounded-lg flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-canneo-800">CANNEO</span>
        </div>

        {/* Search (desktop) */}
        <div className="hidden lg:flex lg:flex-1">
          <div className="max-w-md w-full">
            {/* Placeholder para busca global */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-canneo-100 rounded-full flex items-center justify-center">
                <span className="text-canneo-700 font-semibold text-sm">
                  {doctorProfile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {doctorProfile?.name?.split(' ')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {membership?.organization?.name || 'Organizacao'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {doctorProfile?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      CRM {doctorProfile?.crm}-{doctorProfile?.ufCrm}
                    </p>
                  </div>

                  <Link
                    href="/settings/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Configuracoes
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    disabled={logoutLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutLoading ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <MobileNavLink href="/dashboard" onClick={() => setShowMobileMenu(false)}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink href="/patients" onClick={() => setShowMobileMenu(false)}>
              Pacientes
            </MobileNavLink>
            <MobileNavLink href="/schedule" onClick={() => setShowMobileMenu(false)}>
              Agenda
            </MobileNavLink>
            <MobileNavLink href="/consultations" onClick={() => setShowMobileMenu(false)}>
              Consultas
            </MobileNavLink>
            <MobileNavLink href="/medical-records" onClick={() => setShowMobileMenu(false)}>
              Prontuarios
            </MobileNavLink>
            <MobileNavLink href="/anvisa-reports" onClick={() => setShowMobileMenu(false)}>
              Laudos ANVISA
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}
