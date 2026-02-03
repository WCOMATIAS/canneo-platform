'use client';

import { useState, useEffect } from 'react';

interface Pharmacy {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended';
  anvisaLicense: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalOrders: number;
  createdAt: string;
}

const statusLabels = {
  pending: 'Pendente',
  active: 'Ativa',
  suspended: 'Suspensa',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, [filter]);

  async function fetchPharmacies() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter.status && { status: filter.status }),
        ...(filter.search && { search: filter.search }),
      });

      const response = await fetch(`/api/admin/pharmacies?${params}`);
      const data = await response.json();
      setPharmacies(data.pharmacies || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproval(pharmacyId: string, action: 'approve' | 'reject') {
    try {
      await fetch(`/api/admin/pharmacies/${pharmacyId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setShowModal(false);
      fetchPharmacies();
    } catch (error) {
      console.error('Error updating pharmacy:', error);
    }
  }

  async function handleStatusChange(pharmacyId: string, newStatus: Pharmacy['status']) {
    try {
      await fetch(`/api/admin/pharmacies/${pharmacyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchPharmacies();
    } catch (error) {
      console.error('Error updating pharmacy status:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmácias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as farmácias parceiras
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {pharmacies.filter(p => p.status === 'pending').length} pendentes
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Nome ou CNPJ..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-canneo-500 focus:ring-canneo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-canneo-500 focus:ring-canneo-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="active">Ativa</option>
              <option value="suspended">Suspensa</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', search: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Pharmacies Table */}
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
                  Farmácia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pharmacy.tradeName}</div>
                      <div className="text-sm text-gray-500">{pharmacy.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pharmacy.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pharmacy.address.city}</div>
                    <div className="text-sm text-gray-500">{pharmacy.address.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[pharmacy.status]}`}>
                      {statusLabels[pharmacy.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pharmacy.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {pharmacy.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setShowModal(true);
                        }}
                        className="text-canneo-600 hover:text-canneo-900"
                      >
                        Revisar
                      </button>
                    )}
                    {pharmacy.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(pharmacy.id, 'suspended')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspender
                      </button>
                    )}
                    {pharmacy.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(pharmacy.id, 'active')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Reativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approval Modal */}
      {showModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Revisar Farmácia
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nome Fantasia</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPharmacy.tradeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Razão Social</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPharmacy.legalName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPharmacy.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Licença ANVISA</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPharmacy.anvisaLicense}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPharmacy.address.street}, {selectedPharmacy.address.number} -{' '}
                  {selectedPharmacy.address.city}/{selectedPharmacy.address.state}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  Verifique a licença ANVISA e o CNPJ antes de aprovar.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApproval(selectedPharmacy.id, 'reject')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleApproval(selectedPharmacy.id, 'approve')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
