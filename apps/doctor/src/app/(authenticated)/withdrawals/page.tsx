'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, StatsCard, Icon, Button, Badge } from '@/components/ui';

interface Withdrawal {
  id: string;
  amount: number;
  bankAccount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
}

const withdrawals: Withdrawal[] = [
  {
    id: '1',
    amount: 1500.0,
    bankAccount: 'Nubank - ****1234',
    status: 'completed',
    requestedAt: '2024-01-14',
    completedAt: '2024-01-15',
  },
  {
    id: '2',
    amount: 2000.0,
    bankAccount: 'Nubank - ****1234',
    status: 'processing',
    requestedAt: '2024-01-16',
  },
  {
    id: '3',
    amount: 800.0,
    bankAccount: 'Itaú - ****5678',
    status: 'completed',
    requestedAt: '2024-01-10',
    completedAt: '2024-01-11',
  },
  {
    id: '4',
    amount: 1200.0,
    bankAccount: 'Nubank - ****1234',
    status: 'completed',
    requestedAt: '2024-01-05',
    completedAt: '2024-01-06',
  },
];

const statusConfig = {
  pending: { label: 'Pendente', variant: 'warning' as const, icon: 'schedule' },
  processing: { label: 'Processando', variant: 'primary' as const, icon: 'sync' },
  completed: { label: 'Concluído', variant: 'success' as const, icon: 'check_circle' },
  failed: { label: 'Falhou', variant: 'error' as const, icon: 'error' },
};

const bankAccounts = [
  { id: '1', bank: 'Nubank', type: 'Conta Corrente', number: '****1234' },
  { id: '2', bank: 'Itaú', type: 'Conta Corrente', number: '****5678' },
];

export default function WithdrawalsPage() {
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');

  const availableBalance = 4580.0;
  const pendingBalance = 1250.0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleWithdraw = () => {
    // Simulate withdrawal
    alert(`Saque de ${formatCurrency(parseFloat(withdrawAmount))} solicitado!`);
    setShowModal(false);
    setWithdrawAmount('');
    setSelectedAccount('');
  };

  return (
    <AppLayout title="Saques" subtitle="Gerenciar saques e histórico">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Saldo Disponível"
          value={formatCurrency(availableBalance)}
          subtitle="Disponível para saque imediato"
          icon="account_balance_wallet"
          variant="success"
        />
        <StatsCard
          title="Saldo Pendente"
          value={formatCurrency(pendingBalance)}
          subtitle="Será liberado em até 7 dias"
          icon="schedule"
          variant="warning"
        />
        <StatsCard
          title="Total Sacado (mês)"
          value={formatCurrency(5500.0)}
          subtitle="Janeiro 2024"
          icon="trending_up"
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Histórico de Saques"
              action={
                <Button variant="primary" icon="account_balance_wallet" onClick={() => setShowModal(true)}>
                  Solicitar Saque
                </Button>
              }
            />
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Conta</th>
                    <th>Status</th>
                    <th>Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="text-gray-500">
                        {new Date(withdrawal.requestedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="font-medium text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="text-gray-500">{withdrawal.bankAccount}</td>
                      <td>
                        <Badge variant={statusConfig[withdrawal.status].variant}>
                          <Icon
                            name={statusConfig[withdrawal.status].icon}
                            size="sm"
                            className="mr-1"
                          />
                          {statusConfig[withdrawal.status].label}
                        </Badge>
                      </td>
                      <td className="text-gray-500">
                        {withdrawal.completedAt
                          ? new Date(withdrawal.completedAt).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Withdraw */}
          <Card>
            <CardHeader title="Saque Rápido" />
            <div className="space-y-4">
              <div>
                <label className="label">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0,00"
                    className="input pl-10"
                    max={availableBalance}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Disponível: {formatCurrency(availableBalance)}
                </p>
              </div>

              <div>
                <label className="label">Conta de Destino</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="input"
                >
                  <option value="">Selecione...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank} - {account.number}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                className="w-full"
                icon="account_balance_wallet"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !selectedAccount || parseFloat(withdrawAmount) > availableBalance}
              >
                Solicitar Saque
              </Button>
            </div>
          </Card>

          {/* Bank Accounts */}
          <Card>
            <CardHeader
              title="Contas Bancárias"
              action={
                <Button variant="ghost" size="sm" icon="add">
                  Adicionar
                </Button>
              }
            />
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon name="account_balance" className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{account.bank}</p>
                    <p className="text-sm text-gray-500">
                      {account.type} - {account.number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Info */}
          <Card className="bg-primary-50 border-primary-100">
            <div className="flex gap-3">
              <Icon name="info" className="text-primary-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-900">Prazo de Processamento</p>
                <p className="text-sm text-primary-700 mt-1">
                  Saques solicitados até 14h são processados no mesmo dia útil. Após esse horário,
                  serão processados no próximo dia útil.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Solicitar Saque</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-success-50 rounded-xl">
                <p className="text-sm text-success-600">Saldo disponível</p>
                <p className="text-2xl font-bold text-success-700">
                  {formatCurrency(availableBalance)}
                </p>
              </div>

              <div>
                <label className="label">Valor do Saque</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="input pl-10"
                    max={availableBalance}
                  />
                </div>
              </div>

              <div>
                <label className="label">Conta de Destino</label>
                <select className="input">
                  <option value="">Selecione uma conta...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank} - {account.type} - {account.number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" icon="check">
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
