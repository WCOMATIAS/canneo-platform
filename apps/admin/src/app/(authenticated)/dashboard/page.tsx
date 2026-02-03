'use client';

import Link from 'next/link';

interface StatCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  badge?: string;
}

function StatCard({ icon, iconBgColor, iconColor, title, value, trend, badge }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 ${iconBgColor} rounded-lg ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span className="flex items-center text-secondary text-xs font-bold bg-secondary/10 px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
            {trend.value}
          </span>
        )}
        {badge && (
          <span className="flex items-center text-text-muted dark:text-slate-400 text-xs font-medium px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-text-muted dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-text-main dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

interface ShortcutButtonProps {
  icon: string;
  label: string;
  iconColor: string;
  hoverBgColor: string;
}

function ShortcutButton({ icon, label, iconColor, hoverBgColor }: ShortcutButtonProps) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
      <div className={`size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${iconColor} group-hover:${hoverBgColor} group-hover:text-white transition-colors`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-sm font-semibold text-text-main dark:text-slate-200">{label}</span>
    </button>
  );
}

function PlatformGrowthChart() {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-text-main dark:text-white text-base font-bold">Crescimento da Plataforma</h3>
          <p className="text-text-muted dark:text-slate-400 text-sm mt-1">Novas consultas nos últimos 30 dias</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-secondary text-2xl font-bold tracking-tight">+15.4%</span>
          <div className="bg-secondary/10 text-secondary p-1 rounded">
            <span className="material-symbols-outlined text-sm">north_east</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[240px]">
        <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150">
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#30abe8" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#30abe8" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z" fill="url(#chartGradient)"></path>
          <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#30abe8" strokeLinecap="round" strokeWidth="3" vectorEffect="non-scaling-stroke"></path>
        </svg>
      </div>

      <div className="flex justify-between mt-4 text-xs font-medium text-text-muted dark:text-slate-500">
        <span>01 Jun</span>
        <span>05 Jun</span>
        <span>10 Jun</span>
        <span>15 Jun</span>
        <span>20 Jun</span>
        <span>25 Jun</span>
        <span>30 Jun</span>
      </div>
    </div>
  );
}

function QuickShortcuts() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Atalhos Rápidos</h3>
      <div className="grid grid-cols-2 gap-3 h-full">
        <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <span className="text-sm font-semibold text-text-main dark:text-slate-200">Aprovar Médico</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">campaign</span>
          </div>
          <span className="text-sm font-semibold text-text-main dark:text-slate-200">Novo Aviso</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">summarize</span>
          </div>
          <span className="text-sm font-semibold text-text-main dark:text-slate-200">Relatório Diário</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">settings_account_box</span>
          </div>
          <span className="text-sm font-semibold text-text-main dark:text-slate-200">Gestão Acessos</span>
        </button>
      </div>
    </div>
  );
}

interface Transaction {
  id: string;
  doctor: string;
  patient: string;
  amount: string;
  status: 'paid' | 'pending' | 'cancelled';
  date: string;
}

function RecentTransactions() {
  const transactions: Transaction[] = [
    { id: '#TR-4291', doctor: 'Dr. Roberto Silva', patient: 'Ana Clara Souza', amount: 'R$ 250,00', status: 'paid', date: 'Hoje, 14:30' },
    { id: '#TR-4290', doctor: 'Dra. Juliana Mendes', patient: 'Carlos Eduardo', amount: 'R$ 320,00', status: 'pending', date: 'Hoje, 13:15' },
    { id: '#TR-4289', doctor: 'Dr. Pedro Santos', patient: 'Maria Oliveira', amount: 'R$ 180,00', status: 'paid', date: 'Ontem, 16:45' },
  ];

  const statusStyles = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    paid: 'Pago',
    pending: 'Pendente',
    cancelled: 'Cancelado',
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-text-main dark:text-white">Transações Recentes</h3>
        <Link href="/ledger" className="text-primary text-sm font-medium hover:underline">Ver tudo</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-muted dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Médico</th>
              <th scope="col" className="px-6 py-3">Paciente</th>
              <th scope="col" className="px-6 py-3">Valor</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-text-main dark:text-white">{transaction.id}</td>
                <td className="px-6 py-4 text-text-main dark:text-slate-300">{transaction.doctor}</td>
                <td className="px-6 py-4 text-text-muted dark:text-slate-400">{transaction.patient}</td>
                <td className="px-6 py-4 text-text-main dark:text-white font-medium">{transaction.amount}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusStyles[transaction.status]}`}>
                    {statusLabels[transaction.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted dark:text-slate-400">{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="calendar_today"
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          title="Consultas Hoje"
          value="42"
          trend={{ value: '+5%', positive: true }}
        />
        <StatCard
          icon="payments"
          iconBgColor="bg-secondary/10"
          iconColor="text-secondary"
          title="Faturamento Total"
          value="R$ 145.200"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          icon="pie_chart"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Taxas Canneo"
          value="R$ 14.520"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          icon="account_balance_wallet"
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          title="Saques Pendentes"
          value="12"
          badge="8 pendentes"
        />
      </section>

      {/* Main Chart & Shortcuts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PlatformGrowthChart />
        <QuickShortcuts />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Footer */}
      <div className="mt-8 mb-4 text-center">
        <p className="text-xs text-text-muted dark:text-slate-500">© 2024 CANNEO Health Tech. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
