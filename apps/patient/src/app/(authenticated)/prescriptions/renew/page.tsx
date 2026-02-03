'use client';

import { useState } from 'react';
import Link from 'next/link';

const eligiblePrescriptions = [
  {
    id: '1',
    code: 'REC-2025-089',
    doctor: 'Dr. Carlos Mendes',
    doctorCrm: 'CRM/SP 123456',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialty: 'Neurologista',
    medication: 'Cannabidiol Full Spectrum 1500mg',
    dosage: '10 gotas / dia',
    issuedAt: '25 Mai, 2025',
    expiresIn: 7,
    renewalPrice: 150,
  },
  {
    id: '2',
    code: 'REC-2025-076',
    doctor: 'Dra. Ana Beatriz Santos',
    doctorCrm: 'CRM/SP 789012',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    specialty: 'Psiquiatra',
    medication: 'Óleo CBD + CBN Sleep 2000mg',
    dosage: '6 gotas antes de dormir',
    issuedAt: '10 Abr, 2025',
    expiresIn: 21,
    renewalPrice: 180,
  },
];

const renewalHistory = [
  { id: 1, code: 'REC-2024-045', date: '15 Dez, 2024', doctor: 'Dr. Carlos Mendes', status: 'approved' },
  { id: 2, code: 'REC-2024-032', date: '20 Set, 2024', doctor: 'Dr. Carlos Mendes', status: 'approved' },
  { id: 3, code: 'REC-2024-018', date: '10 Jun, 2024', doctor: 'Dra. Ana Beatriz', status: 'approved' },
];

export default function PrescriptionRenewPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    doctor: 'same',
    message: '',
    feeling: '',
    authorizePayment: false,
  });

  const selectedRx = eligiblePrescriptions.find((p) => p.id === selectedPrescription);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/prescriptions"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar para Receitas
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Renovação de Receita</h1>
        <p className="text-slate-500 mt-1">Gerencie a validade de suas prescrições e solicite novas receitas.</p>
      </div>

      {/* Warning Banner */}
      {eligiblePrescriptions.some((p) => p.expiresIn <= 7) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 text-lg">Sua receita expira em breve</h3>
            <p className="text-amber-800 text-sm mt-1">
              Recomendamos renovar agora para evitar interrupções no seu tratamento.
            </p>
          </div>
          <span className="hidden md:inline-flex bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Ação Necessária
          </span>
        </div>
      )}

      {/* Eligible Prescriptions */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Receitas Elegíveis para Renovação</h2>
        <div className="grid gap-4">
          {eligiblePrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                selectedPrescription === prescription.id
                  ? 'border-primary shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => {
                setSelectedPrescription(prescription.id);
                setShowForm(true);
              }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Medication Info */}
                <div className="flex-1 flex gap-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-3xl">medication</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{prescription.medication}</h3>
                    <p className="text-primary font-medium">{prescription.dosage}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Uso Contínuo
                      </span>
                      {prescription.expiresIn <= 7 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          Expira em {prescription.expiresIn} dias
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-3 md:border-l md:border-slate-200 md:pl-6">
                  <img
                    src={prescription.doctorAvatar}
                    alt={prescription.doctor}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{prescription.doctor}</p>
                    <p className="text-sm text-slate-500">{prescription.specialty}</p>
                    <p className="text-xs text-slate-400">{prescription.doctorCrm}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">event</span>
                    Emitida em {prescription.issuedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">payments</span>
                    Renovação: R$ {prescription.renewalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPrescription(prescription.id);
                    setShowForm(true);
                  }}
                >
                  <span className="material-symbols-outlined text-lg">autorenew</span>
                  Solicitar Renovação
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Renewal Form */}
      {showForm && selectedRx && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_document</span>
            Formulário de Renovação
          </h2>

          <div className="space-y-6">
            {/* Selected Prescription */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary">Receita selecionada</p>
              <p className="font-bold text-slate-900">{selectedRx.medication}</p>
              <p className="text-sm text-slate-500">Código: {selectedRx.code}</p>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Médico para renovação</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.doctor === 'same'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="doctor"
                    value="same"
                    checked={formData.doctor === 'same'}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="hidden"
                  />
                  <img
                    src={selectedRx.doctorAvatar}
                    alt={selectedRx.doctor}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{selectedRx.doctor}</p>
                    <p className="text-sm text-slate-500">Mesmo médico (recomendado)</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.doctor === 'other'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="doctor"
                    value="other"
                    checked={formData.doctor === 'other'}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="hidden"
                  />
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">person_search</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Outro médico</p>
                    <p className="text-sm text-slate-500">Escolher da lista</p>
                  </div>
                </label>
              </div>
            </div>

            {/* How are you feeling */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Como está se sentindo com o tratamento?</label>
              <select
                value={formData.feeling}
                onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
              >
                <option value="">Selecione uma opção</option>
                <option value="great">Muito bem, ótimos resultados</option>
                <option value="good">Bem, com melhoras</option>
                <option value="same">Igual, sem mudanças significativas</option>
                <option value="adjust">Preciso ajustar a dosagem</option>
                <option value="bad">Não estou tendo resultados</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem para o médico (opcional)</label>
              <textarea
                rows={4}
                placeholder="Descreva como tem sido seu tratamento, se houve alguma mudança nos sintomas, efeitos colaterais, etc."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-700">Valor da consulta de renovação</span>
                <span className="text-2xl font-black text-primary">
                  R$ {selectedRx.renewalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.authorizePayment}
                  onChange={(e) => setFormData({ ...formData, authorizePayment: e.target.checked })}
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600">
                  Autorizo a cobrança da consulta de renovação no valor acima. O pagamento será processado após a aprovação do médico.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              disabled={!formData.authorizePayment || !formData.feeling}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
              Enviar Solicitação de Renovação
            </button>
          </div>
        </section>
      )}

      {/* Renewal History */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Histórico de Renovações</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Código</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Médico</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewalHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-primary">{item.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.doctor}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Aprovada
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
