'use client';

import { useState, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  crm: string;
  crmState: string;
  specialty: string;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  consultationPrice: number;
  totalConsultations: number;
  rating: number;
  createdAt: string;
  documents?: {
    name: string;
    type: string;
    size: string;
    date: string;
  }[];
}

const statusLabels = {
  pending: 'Verificação Pendente',
  verified: 'Verificado',
  rejected: 'Rejeitado',
  suspended: 'Suspenso',
};

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400',
};

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Roberto Alves',
    email: 'roberto.alves@medico.com',
    phone: '(11) 99999-8888',
    crm: '123456',
    crmState: 'SP',
    specialty: 'Cardiologista',
    status: 'pending',
    consultationPrice: 25000,
    totalConsultations: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    documents: [
      { name: 'CRM-Frente.jpg', type: 'image', size: '2.4 MB', date: '24 Out 2023' },
      { name: 'Diploma-Medicina.pdf', type: 'pdf', size: '1.8 MB', date: '24 Out 2023' },
      { name: 'Comp-Residencia.pdf', type: 'pdf', size: '840 KB', date: '24 Out 2023' },
    ],
  },
  {
    id: '2',
    name: 'Dra. Ana Paula Santos',
    email: 'ana.santos@medico.com',
    phone: '(21) 98888-7777',
    crm: '654321',
    crmState: 'RJ',
    specialty: 'Dermatologista',
    status: 'verified',
    consultationPrice: 30000,
    totalConsultations: 127,
    rating: 4.8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@medico.com',
    phone: '(31) 97777-6666',
    crm: '789012',
    crmState: 'MG',
    specialty: 'Ortopedista',
    status: 'pending',
    consultationPrice: 28000,
    totalConsultations: 0,
    rating: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      { name: 'CRM-Frente.jpg', type: 'image', size: '1.9 MB', date: '28 Out 2023' },
      { name: 'Diploma.pdf', type: 'pdf', size: '2.1 MB', date: '28 Out 2023' },
    ],
  },
  {
    id: '4',
    name: 'Dra. Juliana Costa',
    email: 'juliana.costa@medico.com',
    phone: '(41) 96666-5555',
    crm: '345678',
    crmState: 'PR',
    specialty: 'Ginecologista',
    status: 'verified',
    consultationPrice: 27000,
    totalConsultations: 89,
    rating: 4.9,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter.status && { status: filter.status }),
        ...(filter.search && { search: filter.search }),
      });

      const response = await fetch(`/api/admin/doctors?${params}`);
      const data = await response.json();
      setDoctors(data.doctors || mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(doctorId: string, action: 'verify' | 'reject') {
    try {
      await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: action === 'reject' ? rejectionReason : undefined }),
      });
      setShowModal(false);
      setRejectionReason('');
      fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  }

  async function handleStatusChange(doctorId: string, newStatus: Doctor['status']) {
    try {
      await fetch(`/api/admin/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    if (filter.status && doctor.status !== filter.status) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        doctor.name.toLowerCase().includes(search) ||
        doctor.email.toLowerCase().includes(search) ||
        doctor.crm.includes(search)
      );
    }
    return true;
  });

  const pendingCount = doctors.filter((d) => d.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white tracking-tight">Gestão de Médicos</h1>
          <p className="text-text-muted dark:text-slate-400 mt-1">Verifique e gerencie os médicos cadastrados na plataforma</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <span className="material-symbols-outlined text-[16px] mr-1.5">priority_high</span>
            {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">search</span>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                placeholder="Buscar por nome, email ou CRM..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-text-main dark:text-white placeholder-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="verified">Verificado</option>
            <option value="rejected">Rejeitado</option>
            <option value="suspended">Suspenso</option>
          </select>
          {(filter.status || filter.search) && (
            <button
              onClick={() => setFilter({ status: '', search: '' })}
              className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-text-main dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">Médico</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">CRM</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400">Especialidade</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-center">Consultas</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">{doctor.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main dark:text-white">{doctor.name}</p>
                          <p className="text-xs text-text-muted">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-text-main dark:text-white">{doctor.crm}</p>
                      <p className="text-xs text-text-muted">{doctor.crmState}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-main dark:text-slate-300">
                      {doctor.specialty}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[doctor.status]}`}>
                        {statusLabels[doctor.status]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="text-sm font-medium text-text-main dark:text-white">{doctor.totalConsultations}</p>
                      {doctor.rating > 0 && (
                        <p className="text-xs text-text-muted flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-yellow-500 text-[14px] filled">star</span>
                          {doctor.rating.toFixed(1)}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {doctor.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          Verificar
                        </button>
                      ) : doctor.status === 'verified' ? (
                        <button
                          onClick={() => handleStatusChange(doctor.id, 'suspended')}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Suspender
                        </button>
                      ) : doctor.status === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(doctor.id, 'verified')}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium transition-colors"
                        >
                          Reativar
                        </button>
                      ) : (
                        <span className="text-text-muted text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-text-main dark:text-white">Verificação de Profissional</h2>
                <p className="text-text-muted dark:text-slate-400 mt-1">Analise os documentos para aprovar ou reprovar o cadastro</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-main dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Doctor Profile */}
              <div className="lg:col-span-1">
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="relative mb-4">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-sm">
                      <span className="text-primary text-3xl font-bold">{selectedDoctor.name.charAt(0)}</span>
                    </div>
                    <div className="absolute bottom-0 right-0 size-6 bg-yellow-400 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[14px]">priority_high</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">{selectedDoctor.name}</h3>
                  <p className="text-primary font-medium text-sm">{selectedDoctor.specialty}</p>
                  <span className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[selectedDoctor.status]}`}>
                    {statusLabels[selectedDoctor.status]}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-text-muted text-lg">badge</span>
                    <span className="text-text-main dark:text-white">{selectedDoctor.crm}-{selectedDoctor.crmState}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-text-muted text-lg">mail</span>
                    <span className="text-text-main dark:text-white break-all">{selectedDoctor.email}</span>
                  </div>
                  {selectedDoctor.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-text-muted text-lg">phone</span>
                      <span className="text-text-main dark:text-white">{selectedDoctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-text-muted text-lg">calendar_today</span>
                    <span className="text-text-main dark:text-white">
                      {new Date(selectedDoctor.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Tip Box */}
                <div className="mt-4 bg-blue-50 dark:bg-primary/10 rounded-lg p-4 border border-blue-100 dark:border-primary/20">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                      <p className="text-sm font-bold text-primary">Dica de Verificação</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Verifique se o nome no diploma coincide com o registro no CRM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents & Decision */}
              <div className="lg:col-span-2 space-y-6">
                {/* Documents */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">folder_open</span>
                      Documentação Enviada
                    </h3>
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-text-muted px-2 py-1 rounded">
                      {selectedDoctor.documents?.length || 0} arquivos
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedDoctor.documents || []).map((doc, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                        <div className={`p-2 rounded ${doc.type === 'image' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                          <span className="material-symbols-outlined text-[20px]">{doc.type === 'image' ? 'image' : 'description'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-main dark:text-white truncate">{doc.name}</p>
                          <p className="text-xs text-text-muted">{doc.size} • {doc.date}</p>
                        </div>
                        <button className="text-text-muted hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      </div>
                    ))}
                    {(!selectedDoctor.documents || selectedDoctor.documents.length === 0) && (
                      <p className="text-sm text-text-muted col-span-2 text-center py-4">Nenhum documento enviado</p>
                    )}
                  </div>
                </div>

                {/* Decision */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">gavel</span>
                      Parecer da Análise
                    </h3>
                  </div>
                  <div className="p-4">
                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">
                      Observações ou Motivo da Reprovação
                      <span className="text-text-muted font-normal ml-1">(Obrigatório em caso de reprovação)</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm p-3 placeholder:text-text-muted"
                      placeholder="Descreva os problemas encontrados nos documentos ou deixe uma observação..."
                      rows={3}
                    />
                    <p className="mt-2 text-xs text-text-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">email</span>
                      Este texto será enviado automaticamente para o médico em caso de reprovação.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleVerification(selectedDoctor.id, 'reject')}
                    disabled={!rejectionReason.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    Reprovar
                  </button>
                  <button
                    onClick={() => handleVerification(selectedDoctor.id, 'verify')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Aprovar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
