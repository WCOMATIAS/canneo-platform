'use client';

import { Icon } from '@/components/ui/Icon';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <Icon
            name="search"
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon name="notifications" className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                  <p className="text-sm text-gray-900">Nova consulta agendada</p>
                  <p className="text-xs text-gray-500 mt-1">Há 5 minutos</p>
                </div>
                <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                  <p className="text-sm text-gray-900">Saque aprovado: R$ 500,00</p>
                  <p className="text-xs text-gray-500 mt-1">Há 1 hora</p>
                </div>
                <div className="p-4 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">Paciente entrou na sala</p>
                  <p className="text-xs text-gray-500 mt-1">Há 2 horas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Icon name="person" className="text-primary-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Dr. João Silva</p>
            <p className="text-xs text-gray-500">CRM 12345-SP</p>
          </div>
        </div>
      </div>
    </header>
  );
}
