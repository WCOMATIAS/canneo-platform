'use client';

import { useState, useEffect } from 'react';

interface LedgerEntry {
  id: string;
  type: 'credit' | 'debit' | 'fee' | 'withdrawal' | 'refund';
  amount: number;
  balance: number;
  description: string;
  reference: string;
  referenceType: 'consultation' | 'order' | 'withdrawal' | 'adjustment';
  userId: string;
  userName: string;
  userRole: 'doctor' | 'pharmacy';
  createdAt: string;
  status?: 'pending' | 'processing' | 'paid' | 'cancelled';
  bankAccount?: string;
}

interface LedgerSummary {
  totalCredits: number;
  totalDebits: number;
  totalFees: number;
  pendingWithdrawals: number;
  platformBalance: number;
}

type TabType = 'ledger' | 'gateway' | 'commissions' | 'withdrawals';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  paid: 'Pago',
  cancelled: 'Cancelado',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  const trendColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    negative: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    neutral: 'bg-primary/10 text-primary',
  };

  return (
    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <p className="text-text-muted dark:text-slate-400 text-sm font-medium">{title}</p>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${trendColors[trend.type]}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text-main dark:text-white mt-2">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('withdrawals');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchLedger();
  }, [activeTab, currentPage]);

  async function fetchLedger() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        tab: activeTab,
      });

      const [entriesRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/ledger?${params}`),
        fetch('/api/admin/ledger/summary'),
      ]);

      const entriesData = await entriesRes.json();
      const summaryData = await summaryRes.json();

      setEntries(entriesData.entries || mockEntries);
      setTotalPages(entriesData.totalPages || 25);
      setTotalResults(entriesData.total || 124);
      setSummary(summaryData.totalCredits ? summaryData : mockSummary);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      setEntries(mockEntries);
      setSummary(mockSummary);
      setTotalPages(25);
      setTotalResults(124);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ledger', label: 'Livro Caixa Geral' },
    { id: 'gateway', label: 'Taxas de Gateway' },
    { id: 'commissions', label: 'Comissões Canneo' },
    { id: 'withdrawals', label: 'Saques Solicitados' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Volume Total da Plataforma"
          value={summary ? formatCurrency(summary.totalCredits) : 'R$ 4.231.500,00'}
          subtitle="Valor bruto de mercadorias"
          trend={{ value: '+12%', type: 'positive' }}
        />
        <StatCard
          title="Pagamentos Pendentes"
          value={summary ? formatCurrency(summary.pendingWithdrawals) : 'R$ 124.500,00'}
          subtitle="Aguardando aprovação"
          trend={{ value: '+5%', type: 'negative' }}
        />
        <StatCard
          title="Receita Líquida Canneo"
          value={summary ? formatCurrency(summary.totalFees) : 'R$ 42.300,00'}
          subtitle="Taxas de plataforma coletadas"
          trend={{ value: '+8%', type: 'positive' }}
        />
        <StatCard
          title="Comissões Totais"
          value={summary ? formatCurrency(summary.totalDebits) : 'R$ 84.600,00'}
          subtitle="Taxas de vendedores agregadas"
          trend={{ value: 'Estável', type: 'neutral' }}
        />
      </section>

      {/* Main Table Section */}
      <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 pt-2">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-3 pt-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-primary font-bold'
                    : 'text-text-muted hover:text-text-main dark:text-slate-400 dark:hover:text-white border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-text-main dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filtrar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-text-main dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              Jan 2025
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-text-main dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">download</span>
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">Fornecedor</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">Data da Solicitação</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-right">Valor</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">Dados Bancários</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main dark:text-white">{entry.userName}</span>
                        <span className="text-xs text-text-muted">ID: {entry.reference}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-main dark:text-slate-300">
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="text-text-muted text-xs ml-1">
                        {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-text-main dark:text-white text-right tabular-nums">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-main dark:text-slate-300 font-mono">
                      {entry.bankAccount || '**** 1234'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[entry.status || 'pending']}`}>
                        {statusLabels[entry.status || 'pending']}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {entry.status === 'pending' ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                          Aprovar Saque
                        </button>
                      ) : entry.status === 'processing' ? (
                        <button className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors">
                          Detalhes
                        </button>
                      ) : (
                        <button className="text-text-muted hover:text-text-main dark:hover:text-slate-300 text-sm font-medium transition-colors">
                          Ver Recibo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-text-muted dark:text-slate-400">
            Exibindo <span className="font-medium text-text-main dark:text-white">{(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, totalResults)}</span> de{' '}
            <span className="font-medium text-text-main dark:text-white">{totalResults}</span> resultados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-text-muted dark:text-slate-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-text-muted dark:text-slate-400 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Mock data for demonstration
const mockSummary: LedgerSummary = {
  totalCredits: 423150000,
  totalDebits: 8460000,
  totalFees: 4230000,
  pendingWithdrawals: 12450000,
  platformBalance: 398010000,
};

const mockEntries: LedgerEntry[] = [
  {
    id: '1',
    type: 'withdrawal',
    amount: 450000,
    balance: 0,
    description: 'Solicitação de saque',
    reference: '#WD-9281',
    referenceType: 'withdrawal',
    userId: '1',
    userName: 'Dr. Roberto Silva',
    userRole: 'doctor',
    createdAt: new Date().toISOString(),
    status: 'pending',
    bankAccount: '**** 1234',
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 215000,
    balance: 0,
    description: 'Solicitação de saque',
    reference: '#WD-9280',
    referenceType: 'withdrawal',
    userId: '2',
    userName: 'Dra. Juliana Mendes',
    userRole: 'doctor',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'processing',
    bankAccount: '**** 9876',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 890000,
    balance: 0,
    description: 'Solicitação de saque',
    reference: '#WD-9279',
    referenceType: 'withdrawal',
    userId: '3',
    userName: 'Dr. Pedro Santos',
    userRole: 'doctor',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'paid',
    bankAccount: '**** 4567',
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: 120000,
    balance: 0,
    description: 'Solicitação de saque',
    reference: '#WD-9278',
    referenceType: 'withdrawal',
    userId: '4',
    userName: 'Farmácia Saúde Total',
    userRole: 'pharmacy',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'pending',
    bankAccount: '**** 2211',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: 534000,
    balance: 0,
    description: 'Solicitação de saque',
    reference: '#WD-9277',
    referenceType: 'withdrawal',
    userId: '5',
    userName: 'Dra. Ana Carolina',
    userRole: 'doctor',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    status: 'processing',
    bankAccount: '**** 3344',
  },
];
