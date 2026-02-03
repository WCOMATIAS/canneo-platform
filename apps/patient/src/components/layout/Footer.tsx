'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
                <Icon name="medical_services" size="sm" className="text-white" />
              </div>
              <span className="text-xl font-bold">CANNEO</span>
            </div>
            <p className="text-gray-400 text-sm">
              Plataforma de telemedicina especializada em tratamentos com canabinoides.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Pacientes</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/doctors" className="hover:text-white">Encontrar Médico</Link></li>
              <li><Link href="/pharmacy" className="hover:text-white">Farmácia</Link></li>
              <li><Link href="/appointments" className="hover:text-white">Minhas Consultas</Link></li>
              <li><Link href="/documents" className="hover:text-white">Documentos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-white">Sobre Nós</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">Como Funciona</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/privacy" className="hover:text-white">Privacidade</Link></li>
              <li><Link href="/terms" className="hover:text-white">Termos de Uso</Link></li>
              <li><Link href="/lgpd" className="hover:text-white">LGPD</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            2024 CANNEO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <Icon name="mail" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Icon name="phone" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
