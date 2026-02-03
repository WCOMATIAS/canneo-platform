'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: 'home', label: 'Início' },
  { href: '/appointments', icon: 'calendar_month', label: 'Consultas' },
  { href: '/doctors', icon: 'stethoscope', label: 'Médicos' },
];

const marketplaceItems = [
  { href: '/marketplace', icon: 'storefront', label: 'Marketplace' },
  { href: '/orders', icon: 'local_shipping', label: 'Meus Pedidos' },
];

const healthItems = [
  { href: '/wallet', icon: 'wallet', label: 'Carteira' },
  { href: '/prescriptions', icon: 'medication', label: 'Receitas' },
  { href: '/diary', icon: 'edit_note', label: 'Diário' },
  { href: '/exams', icon: 'lab_profile', label: 'Exames' },
];

const clubItems = [
  { href: '/club', icon: 'loyalty', label: 'Clube de Saúde' },
  { href: '/coupons', icon: 'confirmation_number', label: 'Cupons' },
];

const bottomNavItems = [
  { href: '/profile', icon: 'person', label: 'Meu Perfil' },
  { href: '/settings', icon: 'settings', label: 'Configurações' },
  { href: '/help', icon: 'help', label: 'Ajuda' },
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
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-none hidden md:flex flex-col bg-white border-r border-slate-200">
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex flex-col px-3 py-4 gap-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">local_hospital</span>
              </div>
              <h1 className="text-primary text-xl font-bold tracking-tight">CANNEO</h1>
            </div>
            <p className="text-slate-500 text-xs font-medium">Portal do Paciente</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 mt-6 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100"></div>

            {marketplaceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100"></div>

            {healthItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100"></div>

            {clubItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100"></div>

            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!isActive(item.href) ? 'text-slate-400' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.href) ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-3 py-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-slate-600 hover:text-slate-900 transition-colors"
              >
                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-slate-500">logout</span>
                </div>
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto">
        {/* Header */}
        <header className="flex-none sticky top-0 z-10 flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1 rounded-md text-slate-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Painel</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Search */}
            <label className="hidden sm:flex flex-col min-w-40 h-10 w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100">
                <div className="text-slate-400 flex border-none items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-400 px-3 text-sm font-normal text-slate-900"
                  placeholder="Buscar consultas, médicos..."
                />
              </div>
            </label>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 text-slate-700 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              {/* Avatar */}
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                  alt="Maria Silva"
                  className="rounded-full size-10 border-2 border-white shadow-sm object-cover"
                />
                <span className="hidden lg:block text-sm font-medium text-slate-700">Maria Silva</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
