'use client';

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

export function PatientHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title - mobile */}
        <div className="lg:hidden">
          <span className="text-lg font-semibold text-canneo-800">CANNEO</span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>

          {/* User avatar - mobile */}
          <div className="lg:hidden w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
