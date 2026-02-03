'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Painel' },
  { href: '/agenda', icon: 'calendar_month', label: 'Agenda' },
  { href: '/consultations', icon: 'video_camera_front', label: 'Consultas' },
  { href: '/patients', icon: 'groups', label: 'Pacientes' },
  { href: '/prescriptions', icon: 'medication', label: 'Prescrições' },
  { href: '/messages', icon: 'chat', label: 'Mensagens' },
];

const financeItems = [
  { href: '/financial', icon: 'account_balance_wallet', label: 'Financeiro' },
  { href: '/bank-accounts', icon: 'account_balance', label: 'Dados Bancários' },
  { href: '/templates', icon: 'description', label: 'Templates' },
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex gap-3 items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-xl">local_hospital</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 dark:text-white">CANNEO</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Portal do Médico</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          ))}

          <div className="my-2 border-t border-slate-100"></div>

          {financeItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="relative">
              <Avatar
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face"
                name="Dr. Silva"
                size="md"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Dr. Silva</span>
              <span className="text-xs text-slate-500">Cardiologia</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium w-full"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Configurações
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium w-full"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto bg-background-light">
        {children}
      </main>
    </div>
  );
}
