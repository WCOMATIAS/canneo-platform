'use client';

import { useState, useEffect } from 'react';

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userRole: 'doctor' | 'pharmacy';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
    holderName: string;
    holderDocument: string;
  };
  requestedAt: string;
  processedAt: string | null;
  failureReason: string | null;
}

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', userRole: '' });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  async function fetchWithdrawals() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter.status && { status: filter.status }),
        ...(filter.userRole && { userRole: filter.userRole }),
      });

      const response = await fetch(`/api/admin/withdrawals?${params}`);
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess(withdrawalId: string, action: 'approve' | 'reject', reason?: string) {
    setProcessing(true);
    try {
      await fetch(`/api/admin/withdrawals/${withdrawalId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      setShowModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleMarkCompleted(withdrawalId: string) {
    try {
      await fetch(`/api/admin/withdrawals/${withdrawalId}/complete`, {
        method: 'POST',
      });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error completing withdrawal:', error);
    }
  }

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saques</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as solicitações de saque
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-lg font-semibold text-yellow-600">
              {pendingCount} ({formatCurrency(pendingAmount)})
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-canneo-500 focus:ring-canneo-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="completed">Concluído</option>
              <option value="failed">Falhou</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
            <select
              value={filter.userRole}
              onChange={(e) => setFilter({ ...filter, userRole: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-canneo-500 focus:ring-canneo-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="doctor">Médicos</option>
              <option value="pharmacy">Farmácias</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', userRole: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-canneo-600 mx-auto"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dados Bancários
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{withdrawal.userName}</div>
                    <div className="text-sm text-gray-500">
                      {withdrawal.userRole === 'doctor' ? 'Médico' : 'Farmácia'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {withdrawal.bankAccount.bank} - Ag: {withdrawal.bankAccount.agency}
                    </div>
                    <div className="text-sm text-gray-500">
                      CC: {withdrawal.bankAccount.account} ({withdrawal.bankAccount.accountType === 'checking' ? 'Corrente' : 'Poupança'})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[withdrawal.status]}`}>
                      {statusLabels[withdrawal.status]}
                    </span>
                    {withdrawal.failureReason && (
                      <p className="text-xs text-red-600 mt-1">{withdrawal.failureReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(withdrawal.requestedAt).toLocaleDateString('pt-BR')}</div>
                    <div className="text-xs">
                      {new Date(withdrawal.requestedAt).toLocaleTimeString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {withdrawal.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowModal(true);
                        }}
                        className="text-canneo-600 hover:text-canneo-900"
                      >
                        Processar
                      </button>
                    )}
                    {withdrawal.status === 'processing' && (
                      <button
                        onClick={() => handleMarkCompleted(withdrawal.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Marcar Concluído
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Process Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Processar Saque
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Solicitante</p>
                  <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Dados Bancários</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Banco:</span>{' '}
                    {selectedWithdrawal.bankAccount.bank}
                  </div>
                  <div>
                    <span className="text-gray-500">Agência:</span>{' '}
                    {selectedWithdrawal.bankAccount.agency}
                  </div>
                  <div>
                    <span className="text-gray-500">Conta:</span>{' '}
                    {selectedWithdrawal.bankAccount.account}
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>{' '}
                    {selectedWithdrawal.bankAccount.accountType === 'checking' ? 'Corrente' : 'Poupança'}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Titular:</span>{' '}
                    {selectedWithdrawal.bankAccount.holderName}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">CPF/CNPJ:</span>{' '}
                    {selectedWithdrawal.bankAccount.holderDocument}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  Ao aprovar, você confirma que realizará a transferência bancária.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                }}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleProcess(selectedWithdrawal.id, 'reject', 'Dados bancários inválidos')}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleProcess(selectedWithdrawal.id, 'approve')}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
