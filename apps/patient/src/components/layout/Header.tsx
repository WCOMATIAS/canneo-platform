'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon, Button } from '@/components/ui';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock state

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
              <Icon name="medical_services" size="sm" className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CANNEO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/doctors" className="text-gray-600 hover:text-primary-500 font-medium">
              Encontrar Médico
            </Link>
            <Link href="/pharmacy" className="text-gray-600 hover:text-primary-500 font-medium">
              Farmácia
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary-500 font-medium">
              Como Funciona
            </Link>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/appointments">
                  <Button variant="ghost" icon="calendar_month">
                    Minhas Consultas
                  </Button>
                </Link>
                <Link href="/profile">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors">
                    <Icon name="person" className="text-primary-600" />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary">Criar Conta</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link
                href="/doctors"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Encontrar Médico
              </Link>
              <Link
                href="/pharmacy"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Farmácia
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Como Funciona
              </Link>
              <hr className="my-2" />
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" className="w-full">
                  Criar Conta
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
