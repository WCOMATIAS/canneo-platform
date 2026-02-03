'use client';

import { useState } from 'react';
import Link from 'next/link';

const banks = [
  { code: '001', name: 'Banco do Brasil S.A.' },
  { code: '033', name: 'Banco Santander (Brasil) S.A.' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Banco Bradesco S.A.' },
  { code: '341', name: 'Itaú Unibanco S.A.' },
  { code: '260', name: 'Nu Pagamentos S.A. (Nubank)' },
  { code: '077', name: 'Banco Inter S.A.' },
];

const pixTypes = ['CPF', 'E-mail', 'Celular', 'Chave Aleatória'];

export default function BankAccountsPage() {
  const [selectedBank, setSelectedBank] = useState('');
  const [accountType, setAccountType] = useState('corrente');
  const [agency, setAgency] = useState('');
  const [agencyDigit, setAgencyDigit] = useState('');
  const [account, setAccount] = useState('');
  const [accountDigit, setAccountDigit] = useState('');
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Dados bancários salvos com sucesso!');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="max-w-[1000px] w-full mx-auto p-8 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap gap-2 mb-2">
          <Link
            href="/dashboard"
            className="text-slate-500 text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <span className="text-slate-400 text-sm">/</span>
          <Link
            href="/settings"
            className="text-slate-500 text-sm font-medium hover:text-primary transition-colors"
          >
            Perfil
          </Link>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-slate-900 text-sm font-semibold">Dados Bancários</span>
        </nav>

        {/* Page Heading */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">Dados Bancários</h1>
          <p className="text-slate-500 text-base">
            Gerencie suas informações para recebimento de repasses de consultas.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Security Banner */}
          <div className="bg-emerald-50 p-5 flex gap-4 items-start border-b border-emerald-100">
            <span className="material-symbols-outlined text-emerald-700 mt-0.5">verified_user</span>
            <div className="flex flex-col gap-1">
              <p className="text-emerald-700 text-sm font-bold leading-tight">
                Segurança dos Dados
              </p>
              <p className="text-emerald-700/80 text-sm font-normal">
                Os dados informados devem ser de titularidade do CPF cadastrado no CRM. Pagamentos a
                terceiros não são permitidos por normas de compliance.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8">
            {/* Bank Selection */}
            <div>
              <h2 className="text-slate-900 text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance</span>
                Instituição Bancária
              </h2>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Nome do Banco
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden px-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 overflow-hidden">
                    <span className="material-symbols-outlined text-slate-500">
                      account_balance
                    </span>
                  </div>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="bg-transparent border-none text-sm w-full focus:ring-0 text-slate-900"
                  >
                    <option value="">Selecione seu banco</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.code} - {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <h2 className="text-slate-900 text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                Detalhes da Conta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Conta Poupança</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Agência</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="0001"
                    />
                    <input
                      type="text"
                      value={agencyDigit}
                      onChange={(e) => setAgencyDigit(e.target.value)}
                      className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-sm text-center focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Conta</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="12345"
                    />
                    <input
                      type="text"
                      value={accountDigit}
                      onChange={(e) => setAccountDigit(e.target.value)}
                      className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-3 py-3 text-sm text-center focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="X"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PIX Configuration */}
            <div>
              <h2 className="text-slate-900 text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Chave PIX
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  {pixTypes.map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        name="pix_type"
                        checked={pixType === type}
                        onChange={() => setPixType(type)}
                        className="hidden peer"
                      />
                      <div className="px-4 py-2 border border-slate-200 rounded-full text-sm font-medium peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-slate-600">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="Informe sua chave PIX"
                />
              </div>
            </div>

            {/* Submit and Warning */}
            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="material-symbols-outlined text-amber-500">info</span>
                <p className="text-xs leading-tight max-w-[400px]">
                  <span className="font-bold block mb-0.5 text-slate-700">Atenção</span>
                  Alterações nos dados bancários podem levar até 48h para validação interna antes do
                  próximo ciclo de pagamento.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 h-12 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  Salvar Dados Bancários
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Panel */}
        <div className="mt-8">
          <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 text-base font-bold leading-tight">
                Dúvidas sobre o recebimento?
              </p>
              <p className="text-slate-500 text-sm font-normal">
                Confira nossa central de ajuda sobre cronogramas de repasses e taxas.
              </p>
            </div>
            <a
              href="#"
              className="text-sm font-bold leading-normal tracking-[0.015em] flex items-center gap-2 text-primary hover:underline"
            >
              Ver central de ajuda
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center border-t border-slate-200">
        <p className="text-xs text-slate-400">
          © 2024 CANNEO - Portal do Médico. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
