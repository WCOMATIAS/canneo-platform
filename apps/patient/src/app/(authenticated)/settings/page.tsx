'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailConsultas: true,
    smsPedidos: true,
    pushNotifications: true,
    lembretesMedicacao: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    theme: 'light',
  });

  const activeSessions = [
    { id: 1, device: 'Chrome no Windows', location: 'São Paulo, SP', lastActive: 'Agora', current: true },
    { id: 2, device: 'Safari no iPhone', location: 'São Paulo, SP', lastActive: 'Há 2 horas', current: false },
    { id: 3, device: 'Firefox no MacOS', location: 'Rio de Janeiro, RJ', lastActive: 'Há 3 dias', current: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie suas preferências e configurações de conta.</p>
      </div>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <h2 className="text-lg font-bold text-slate-900">Notificações</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Email para consultas</p>
              <p className="text-sm text-slate-500">Receba confirmações e lembretes de consultas por email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailConsultas}
                onChange={(e) => setNotifications({ ...notifications, emailConsultas: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">SMS para pedidos</p>
              <p className="text-sm text-slate-500">Receba atualizações de status dos seus pedidos por SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.smsPedidos}
                onChange={(e) => setNotifications({ ...notifications, smsPedidos: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Push notifications</p>
              <p className="text-sm text-slate-500">Receba notificações em tempo real no navegador</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Lembretes de medicação</p>
              <p className="text-sm text-slate-500">Receba lembretes diários para tomar sua medicação</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.lembretesMedicacao}
                onChange={(e) => setNotifications({ ...notifications, lembretesMedicacao: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">security</span>
          <h2 className="text-lg font-bold text-slate-900">Segurança</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Alterar senha</p>
              <p className="text-sm text-slate-500">Última alteração há 3 meses</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Alterar
            </button>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Autenticação em duas etapas</p>
              <p className="text-sm text-slate-500">Adicione uma camada extra de segurança à sua conta</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.twoFactorEnabled}
                onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-slate-900">Sessões ativas</p>
                <p className="text-sm text-slate-500">Dispositivos conectados à sua conta</p>
              </div>
            </div>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">devices</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            Atual
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Encerrar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">tune</span>
          <h2 className="text-lg font-bold text-slate-900">Preferências</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Idioma</p>
              <p className="text-sm text-slate-500">Escolha o idioma da interface</p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-slate-900">Tema</p>
              <p className="text-sm text-slate-500">Escolha o tema visual</p>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <h2 className="text-lg font-bold text-slate-900">Legal e Privacidade</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <Link href="/settings/privacy" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">shield</span>
              <p className="font-medium text-slate-900">Privacidade e LGPD</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </Link>
          <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">description</span>
              <p className="font-medium text-slate-900">Termos de uso</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">delete_forever</span>
              <div>
                <p className="font-medium text-red-600">Excluir minha conta</p>
                <p className="text-sm text-red-400">Esta ação é irreversível</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-400">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  );
}
