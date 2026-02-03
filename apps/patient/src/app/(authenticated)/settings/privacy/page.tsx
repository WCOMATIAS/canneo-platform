'use client';

import { useState } from 'react';
import Link from 'next/link';

const consentHistory = [
  { id: 1, action: 'Aceite de termos de uso', date: '24 Jan, 2026 às 14:30', ip: '189.45.xxx.xxx' },
  { id: 2, action: 'Consentimento para pesquisa clínica', date: '20 Jan, 2026 às 10:15', ip: '189.45.xxx.xxx' },
  { id: 3, action: 'Aceite de política de privacidade', date: '15 Jan, 2026 às 09:00', ip: '189.45.xxx.xxx' },
  { id: 4, action: 'Consentimento para marketing', date: '10 Jan, 2026 às 16:45', ip: '201.23.xxx.xxx' },
];

export default function PrivacyPage() {
  const [consents, setConsents] = useState({
    research: false,
    marketing: true,
    partners: false,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar para Configurações
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Privacidade e Proteção de Dados</h1>
        <p className="text-slate-500 mt-1">
          Gerencie seus consentimentos e controle seus dados conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined">database</span>
            </div>
            <h3 className="font-bold text-slate-900">Quais dados coletamos</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Dados pessoais (nome, CPF, data de nascimento)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Informações de contato (email, telefone)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Dados de saúde e prontuário médico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Histórico de consultas e prescrições
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <h3 className="font-bold text-slate-900">Como usamos seus dados</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Prestação de serviços de saúde
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Comunicação sobre consultas e pedidos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Melhoria contínua da plataforma
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Cumprimento de obrigações legais
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <span className="material-symbols-outlined">share</span>
            </div>
            <h3 className="font-bold text-slate-900">Com quem compartilhamos</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Médicos e profissionais de saúde
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Farmácias parceiras (com seu consentimento)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Órgãos reguladores (ANVISA)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Prestadores de serviço de pagamento
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <h3 className="font-bold text-slate-900">Seus direitos (LGPD)</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Acesso aos seus dados pessoais
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Correção de dados incompletos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Exclusão de dados (quando aplicável)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Portabilidade dos dados
            </li>
          </ul>
        </div>
      </div>

      {/* Privacy Controls */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">toggle_on</span>
          <h2 className="text-lg font-bold text-slate-900">Controles de Privacidade</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Permitir uso de dados para pesquisa</p>
              <p className="text-sm text-slate-500">Contribua com estudos clínicos usando dados anonimizados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents.research}
                onChange={(e) => setConsents({ ...consents, research: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Receber comunicações de marketing</p>
              <p className="text-sm text-slate-500">Promoções, novidades e ofertas especiais</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents.marketing}
                onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Compartilhar dados com parceiros</p>
              <p className="text-sm text-slate-500">Permitir que parceiros ofereçam serviços personalizados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents.partners}
                onChange={(e) => setConsents({ ...consents, partners: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Data Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 transition-colors">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <span className="material-symbols-outlined text-2xl">visibility</span>
          </div>
          <p className="font-bold text-slate-900">Solicitar meus dados</p>
          <p className="text-sm text-slate-500 text-center">Veja todos os dados que temos sobre você</p>
        </button>

        <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 transition-colors">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <span className="material-symbols-outlined text-2xl">download</span>
          </div>
          <p className="font-bold text-slate-900">Baixar meus dados</p>
          <p className="text-sm text-slate-500 text-center">Exporte seus dados em formato PDF</p>
        </button>

        <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-red-200 hover:border-red-400 transition-colors">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>
          <p className="font-bold text-red-600">Solicitar exclusão</p>
          <p className="text-sm text-red-400 text-center">Solicite a exclusão dos seus dados</p>
        </button>
      </section>

      {/* Consent History */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">history</span>
          <h2 className="text-lg font-bold text-slate-900">Histórico de Consentimentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Ação</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{item.action}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
