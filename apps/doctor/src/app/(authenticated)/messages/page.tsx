'use client';

import { useState } from 'react';

const conversations = [
  {
    id: '1',
    name: 'João Silva',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Doutor, o exame de sangue já está pronto.',
    time: '14:20',
    isOnline: true,
    isActive: true,
    unread: true,
  },
  {
    id: '2',
    name: 'Maria Helena',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'A receita foi enviada para o meu e-mail?',
    time: '10:45',
    isOnline: false,
    isActive: false,
    unread: false,
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Obrigado pela orientação, Dr.',
    time: 'Ontem',
    isOnline: false,
    isActive: false,
    unread: false,
  },
  {
    id: '4',
    name: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Vou marcar o retorno para a próxima semana.',
    time: 'Ontem',
    isOnline: false,
    isActive: false,
    unread: false,
  },
  {
    id: '5',
    name: 'Roberto Santos',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Recebi a prescrição, muito obrigado!',
    time: '2 dias',
    isOnline: false,
    isActive: false,
    unread: false,
  },
];

const messages = [
  {
    id: '1',
    type: 'received',
    content: 'Olá Doutor Ricardo, boa tarde. Conforme conversamos ontem, acabei de receber meus exames.',
    time: '14:15',
  },
  {
    id: '2',
    type: 'received',
    content: '',
    time: '14:16',
    attachment: {
      name: 'Exame_Sangue_Joao.pdf',
      size: '1.2 MB',
      preview: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    },
  },
  {
    id: '3',
    type: 'sent',
    content: 'Olá João! Que ótimo que já saíram os resultados. Vou analisar agora mesmo e te retorno em alguns minutos.',
    time: '14:18',
    read: true,
  },
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recentes');

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar: Conversation List */}
      <aside className="w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900">Mensagens</h1>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>
          {/* SearchBar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-lg">search</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-slate-400"
              placeholder="Buscar paciente ou conversa..."
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('recentes')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'recentes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500'
            }`}
          >
            Recentes
          </button>
          <button
            onClick={() => setActiveTab('favoritos')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'favoritos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500'
            }`}
          >
            Favoritos
          </button>
          <button
            onClick={() => setActiveTab('arquivados')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'arquivados'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500'
            }`}
          >
            Arquivados
          </button>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={`flex items-center gap-4 px-4 min-h-[80px] py-3 cursor-pointer transition-colors border-l-4 ${
                  conversation.id === activeConversation.id
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="relative">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                    style={{ backgroundImage: `url(${conversation.avatar})` }}
                  />
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-slate-900 text-sm font-semibold truncate">
                      {conversation.name}
                    </p>
                    <p className="text-slate-500 text-[11px]">{conversation.time}</p>
                  </div>
                  <p
                    className={`text-sm line-clamp-1 ${
                      conversation.unread ? 'text-primary font-medium' : 'text-slate-500'
                    }`}
                  >
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col bg-slate-50 relative">
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: `url(${activeConversation.avatar})` }}
              />
              {activeConversation.isOnline && (
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-slate-900 font-bold leading-none">
                {activeConversation.name}
              </h3>
              <p
                className={`text-[12px] font-medium ${
                  activeConversation.isOnline ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {activeConversation.isOnline ? 'Online agora' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-slate-600 text-sm font-medium hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">medical_information</span>
              <span>Ficha Clínica</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* ActionPanel: Security Notice */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition-all hover:bg-blue-50">
            <div className="flex gap-3 items-center">
              <span className="material-symbols-outlined text-blue-600">verified_user</span>
              <div className="flex flex-col">
                <p className="text-blue-900 text-sm font-bold leading-tight">
                  Segurança e Privacidade
                </p>
                <p className="text-blue-700 text-xs font-normal">
                  Este chat é criptografado e destinado apenas para orientações sobre o tratamento.
                </p>
              </div>
            </div>
            <a className="text-xs font-bold leading-normal tracking-[0.015em] flex items-center gap-1 text-blue-600 whitespace-nowrap" href="#">
              Saber mais
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Messages Flow */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 flex flex-col">
          {/* Date Divider */}
          <div className="flex justify-center">
            <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Hoje
            </span>
          </div>

          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'received' ? (
                <div className="flex gap-3 max-w-[80%] items-end">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0 mb-1"
                    style={{ backgroundImage: `url(${activeConversation.avatar})` }}
                  />
                  <div className="flex flex-col">
                    {message.attachment ? (
                      <div className="bg-white p-2 rounded-2xl rounded-bl-none shadow-sm border border-slate-200">
                        <div className="rounded-xl overflow-hidden mb-2">
                          <img
                            className="w-full object-cover max-h-60"
                            src={message.attachment.preview}
                            alt="Medical lab report"
                          />
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <span className="material-symbols-outlined text-primary">description</span>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-semibold truncate">
                              {message.attachment.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {message.attachment.size}
                            </span>
                          </div>
                          <button className="ml-auto p-1 text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">download</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm text-slate-800 text-sm leading-relaxed border border-slate-200">
                        {message.content}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 ml-1">{message.time}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
                  <div className="bg-primary p-4 rounded-2xl rounded-br-none shadow-sm text-white text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 mr-1">
                    <span className="text-[10px] text-slate-400">{message.time}</span>
                    {message.read && (
                      <span className="material-symbols-outlined text-sm text-primary">done_all</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          <div className="flex gap-2 items-center text-slate-400 italic text-xs ml-11">
            <span>{activeConversation.name} está digitando...</span>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="flex items-center gap-4">
            {/* Attach button */}
            <button className="flex items-center justify-center rounded-lg h-12 w-12 bg-slate-100 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all shrink-0">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            {/* Input container */}
            <label className="flex-1 flex flex-col">
              <div className="flex w-full items-stretch rounded-xl h-12 bg-slate-100 overflow-hidden border border-transparent focus-within:border-primary/30 transition-all">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-900 px-5 text-sm placeholder:text-slate-400"
                  placeholder="Escreva sua mensagem aqui..."
                />
                <div className="flex items-center pr-3 gap-2">
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-xl">mood</span>
                  </button>
                </div>
              </div>
            </label>
            {/* Send button */}
            <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-primary text-white font-bold gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              <span>Enviar</span>
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <p className="text-[10px] text-slate-400">
              Pressione Enter para enviar, Shift+Enter para quebra de linha
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
