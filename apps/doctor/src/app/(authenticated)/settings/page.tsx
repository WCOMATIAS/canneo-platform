'use client';

import { useState } from 'react';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'values' | 'notifications' | 'security'>('profile');
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: 'person' },
    { id: 'schedule', label: 'Agenda', icon: 'calendar_month' },
    { id: 'values', label: 'Valores', icon: 'payments' },
    { id: 'notifications', label: 'Notificações', icon: 'notifications' },
    { id: 'security', label: 'Segurança', icon: 'lock' },
  ];

  const toggleWorkDay = (dayIndex: number) => {
    setWorkDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie suas preferências e dados</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}>
                  {tab.icon}
                </span>
                <span className={`text-sm ${activeTab === tab.id ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Informações do Perfil</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary">person</span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-slate-50 border border-slate-200">
                    <span className="material-symbols-outlined text-[18px] text-slate-600">photo_camera</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfilePhoto(URL.createObjectURL(file));
                    }} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Foto de Perfil</p>
                  <p className="text-xs text-slate-500 mt-1">JPG ou PNG. Máximo 2MB.</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    defaultValue="Dr. João Silva"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    defaultValue="joao.silva@email.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    defaultValue="(11) 99999-0000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CRM</label>
                  <input
                    type="text"
                    defaultValue="123456"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">UF do CRM</label>
                  <input
                    type="text"
                    defaultValue="SP"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Especialidade</label>
                  <input
                    type="text"
                    defaultValue="Clínica Geral"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mini Bio</label>
                <textarea
                  rows={4}
                  defaultValue="Médico especializado em tratamentos com canabinoides, com mais de 10 anos de experiência em medicina integrativa."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Configurações de Agenda</h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Dias de Atendimento</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => toggleWorkDay(index)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        workDays.includes(index)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Horário de Início</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Horário de Término</label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duração da Consulta</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Antecedência Mínima</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="1">1 hora</option>
                    <option value="2">2 horas</option>
                    <option value="4">4 horas</option>
                    <option value="24">24 horas</option>
                    <option value="48">48 horas</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* Values Tab */}
          {activeTab === 'values' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Valores de Consulta</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primeira Consulta</label>
                  <input
                    type="text"
                    defaultValue="R$ 350,00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Retorno</label>
                  <input
                    type="text"
                    defaultValue="R$ 280,00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Renovação de Receita</label>
                  <input
                    type="text"
                    defaultValue="R$ 200,00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desconto Retorno (%)</label>
                  <input
                    type="number"
                    defaultValue="20"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <span className="material-symbols-outlined text-amber-500 shrink-0">info</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Taxa da Plataforma</p>
                  <p className="text-sm text-amber-700">
                    A CANNEO cobra uma taxa de 15% sobre cada consulta realizada. Você receberá o valor líquido.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar Valores
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Preferências de Notificação</h2>

              {[
                { title: 'Novos agendamentos', desc: 'Receber e-mail quando um paciente agendar consulta', checked: true },
                { title: 'Cancelamentos', desc: 'Ser notificado quando uma consulta for cancelada', checked: true },
                { title: 'Lembretes SMS', desc: 'Enviar lembretes por SMS para pacientes', checked: false },
                { title: 'Push notifications', desc: 'Receber notificações no navegador', checked: true },
                { title: 'Resumo semanal', desc: 'Receber relatório semanal por e-mail', checked: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Alterar Senha</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Senha Atual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nova Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Alterar Senha
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Autenticação em Duas Etapas</h2>
                    <p className="text-sm text-slate-500 mt-1">Adicione uma camada extra de segurança à sua conta</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Ativado
                    </span>
                  </div>
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50">
                    Gerenciar
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Sessões Ativas</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">computer</span>
                      <div>
                        <p className="font-semibold text-slate-900">Chrome - Windows</p>
                        <p className="text-sm text-slate-500">São Paulo, BR • Sessão atual</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">phone_iphone</span>
                      <div>
                        <p className="font-semibold text-slate-900">Safari - iPhone</p>
                        <p className="text-sm text-slate-500">São Paulo, BR • Há 2 dias</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                      Encerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
