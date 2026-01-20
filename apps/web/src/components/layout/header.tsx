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
  Calendar,
  FileText,
  UserPlus,
  Check,
} from 'lucide-react';

// Mock notifications - em producao viriam da API
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'appointment',
    title: 'Consulta em 30 minutos',
    message: 'Consulta com Maria Silva as 14:00',
    time: 'Agora',
    read: false,
  },
  {
    id: '2',
    type: 'patient',
    title: 'Novo paciente cadastrado',
    message: 'Joao Santos foi cadastrado no sistema',
    time: '2h atras',
    read: false,
  },
  {
    id: '3',
    type: 'document',
    title: 'Laudo aprovado',
    message: 'Laudo ANVISA de Ana Costa foi aprovado',
    time: '1 dia atras',
    read: true,
  },
];

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout, logoutLoading } = useAuth();
  const { doctorProfile, membership } = useAuthStore();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'patient':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

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
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              <Bell className="h-5 w-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notificacoes</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-canneo-100 text-canneo-700 px-2 py-0.5 rounded-full">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma notificacao</p>
                      </div>
                    ) : (
                      MOCK_NOTIFICATIONS.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-gray-900`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-canneo-500 rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100">
                    <button className="text-sm text-canneo-600 hover:underline w-full text-center flex items-center justify-center gap-1">
                      <Check className="h-3 w-3" />
                      Marcar todas como lidas
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
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
