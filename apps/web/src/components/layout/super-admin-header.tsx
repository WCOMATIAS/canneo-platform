'use client';

import { Bell, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth } from '@/hooks/use-auth';

export function SuperAdminHeader() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

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
          <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white hover:bg-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

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
