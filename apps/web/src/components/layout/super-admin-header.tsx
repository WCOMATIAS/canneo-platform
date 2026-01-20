'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, Check, Clock, AlertCircle, X, Building2, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth } from '@/hooks/use-auth';
import { useSuperAdminNotifications } from '@/hooks/use-super-admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// Dados mock para quando a API não está disponível
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'info',
    title: 'Nova organizacao cadastrada',
    message: 'Clinica CANNEO Demo foi cadastrada na plataforma.',
    read: false,
    data: {},
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
  },
  {
    id: '2',
    type: 'success',
    title: 'Assinatura ativada',
    message: 'A assinatura do plano TEAM foi ativada com sucesso.',
    read: false,
    data: {},
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
  },
  {
    id: '3',
    type: 'info',
    title: 'Novo medico cadastrado',
    message: 'Dr. Joao Silva foi adicionado a plataforma.',
    read: true,
    data: {},
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
  },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case 'error':
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    case 'success':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'organization':
      return <Building2 className="h-4 w-4 text-purple-400" />;
    case 'subscription':
      return <CreditCard className="h-4 w-4 text-blue-400" />;
    case 'user':
      return <Users className="h-4 w-4 text-green-400" />;
    default:
      return <Bell className="h-4 w-4 text-blue-400" />;
  }
}

function formatTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atras`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atras`;
  return `${Math.floor(diffInSeconds / 86400)}d atras`;
}

export function SuperAdminHeader() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Tentar buscar notificações da API
  const { data: notificationsData, isError } = useSuperAdminNotifications();

  // Usar dados da API se disponíveis, senão usar mock
  const notifications = notificationsData?.notifications || localNotifications;
  const unreadCount = notificationsData?.unreadCount ?? localNotifications.filter(n => !n.read).length;

  // Mark notification as read (local state for mock)
  const handleMarkAsRead = (notificationId: string) => {
    if (isError || !notificationsData) {
      // Atualizar estado local (mock)
      setLocalNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } else {
      // Chamar API
      markAsReadMutation.mutate(notificationId);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (isError || !notificationsData) {
      // Atualizar estado local (mock)
      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } else {
      // Chamar API
      markAllAsReadMutation.mutate();
    }
  };

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/super-admin/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/super-admin/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'notifications'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title - mobile */}
        <div className="lg:hidden">
          <span className="text-lg font-semibold text-white">Super Admin</span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <h3 className="font-semibold text-white">Notificacoes</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-400 hover:text-purple-300 h-auto py-1 px-2"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Marcar lidas
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhuma notificacao</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'px-4 py-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer',
                          !notification.read && 'bg-gray-700/30'
                        )}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn(
                                'text-sm truncate',
                                notification.read ? 'text-gray-300' : 'text-white font-medium'
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                    <p className="text-xs text-center text-gray-500">
                      {isError ? 'Usando dados de exemplo' : `${notifications.length} notificacoes`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-red-400 hover:bg-gray-700"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
