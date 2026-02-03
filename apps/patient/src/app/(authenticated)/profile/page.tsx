'use client';

import { useState } from 'react';
import Link from 'next/link';

const tabs = ['Dados Pessoais', 'Endereço', 'Documentos'];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Dados Pessoais');
  const [formData, setFormData] = useState({
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    birthDate: '1990-05-15',
    gender: 'feminino',
    phone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1500',
    complement: 'Apt 102',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  });

  const addresses = [
    {
      id: 1,
      label: 'Casa',
      icon: 'home',
      street: 'Avenida Paulista, 1500',
      complement: 'Apt 102 - Bela Vista',
      city: 'São Paulo - SP',
      cep: '01310-100',
      isPrimary: true,
    },
    {
      id: 2,
      label: 'Trabalho',
      icon: 'work',
      street: 'Rua das Flores, 450',
      complement: 'Bloco B, Sala 4',
      city: 'São Paulo - SP',
      cep: '05432-000',
      isPrimary: false,
    },
  ];

  const documents = [
    { id: 1, type: 'RG', number: '12.345.678-9', status: 'verified' },
    { id: 2, type: 'CNH', number: '01234567890', status: 'verified' },
    { id: 3, type: 'Comprovante de Residência', file: 'comprovante_jan2026.pdf', status: 'pending' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500 mt-1">Gerencie seus dados pessoais e informações de contato.</p>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
              alt="Maria Silva"
              className="size-24 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-lg">photo_camera</span>
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">Maria Silva</h2>
            <p className="text-slate-500">maria.silva@email.com</p>
            <p className="text-sm text-slate-400 mt-1">Membro desde Janeiro 2024</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Dados Pessoais' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">CPF (somente leitura)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cpf}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">lock</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Gênero</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
                <option value="prefiro-nao-dizer">Prefiro não dizer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Telefone / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <button className="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">save</span>
            Salvar Alterações
          </button>
        </div>
      )}

      {activeTab === 'Endereço' && (
        <div className="space-y-6">
          {/* Address List */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Endereços de Entrega</h3>
            <button className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">add_location</span>
              Adicionar Novo
            </button>
          </div>

          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl border-2 p-5 ${
                  address.isPrimary ? 'border-primary/30' : 'border-slate-200'
                }`}
              >
                {address.isPrimary && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    Principal
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${address.isPrimary ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    <span className="material-symbols-outlined">{address.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{address.street}</p>
                    <p className="text-sm text-slate-500">{address.complement}</p>
                    <p className="text-sm text-slate-500">{address.city} | CEP: {address.cep}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Address Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 mb-4">Adicionar Novo Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">CEP</label>
                <input
                  type="text"
                  placeholder="00000-000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Logradouro</label>
                <input
                  type="text"
                  placeholder="Rua, Avenida, etc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Número</label>
                <input
                  type="text"
                  placeholder="Nº"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Complemento</label>
                <input
                  type="text"
                  placeholder="Apt, Bloco, etc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bairro</label>
                <input
                  type="text"
                  placeholder="Bairro"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cidade</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                </select>
              </div>
            </div>
            <button className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Salvar Endereço
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Documentos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">Meus Documentos</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.type}</p>
                      <p className="text-sm text-slate-500">{doc.number || doc.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Pendente
                      </span>
                    )}
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload New Document */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 mb-4">Enviar Novo Documento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Documento</label>
                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">Selecione</option>
                  <option value="rg">RG</option>
                  <option value="cnh">CNH</option>
                  <option value="comprovante">Comprovante de Residência</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Arquivo</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                    <span className="text-slate-500 text-sm">Clique para enviar</span>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  </label>
                </div>
              </div>
            </div>
            <button className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">upload</span>
              Enviar Documento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
