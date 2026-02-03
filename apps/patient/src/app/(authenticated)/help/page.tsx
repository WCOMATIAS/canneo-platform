'use client';

import { useState } from 'react';

const categories = [
  { id: 'appointments', icon: 'calendar_month', label: 'Consultas e Agendamento', count: 8 },
  { id: 'payments', icon: 'payments', label: 'Pagamentos e Reembolso', count: 6 },
  { id: 'prescriptions', icon: 'medication', label: 'Receitas e Medicamentos', count: 12 },
  { id: 'orders', icon: 'local_shipping', label: 'Pedidos e Entregas', count: 10 },
  { id: 'account', icon: 'person', label: 'Minha Conta', count: 5 },
];

const faqs = [
  {
    id: 1,
    question: 'Como agendar uma consulta?',
    answer: 'Para agendar uma consulta, acesse a seção "Consultas" no menu lateral e clique em "Agendar Consulta". Escolha a especialidade, o médico disponível, a data e horário desejados. Após confirmar o pagamento, você receberá uma confirmação por e-mail.',
    category: 'appointments',
  },
  {
    id: 2,
    question: 'Posso cancelar ou remarcar uma consulta?',
    answer: 'Sim, você pode cancelar ou remarcar sua consulta até 24 horas antes do horário agendado sem cobrança. Acesse "Minhas Consultas", encontre o agendamento e clique em "Remarcar" ou "Cancelar".',
    category: 'appointments',
  },
  {
    id: 3,
    question: 'Como funciona o pagamento das consultas?',
    answer: 'Aceitamos pagamento via cartão de crédito, débito e PIX. O pagamento é realizado no momento do agendamento e você receberá um comprovante por e-mail.',
    category: 'payments',
  },
  {
    id: 4,
    question: 'Como acessar minhas receitas?',
    answer: 'Suas receitas estão disponíveis na seção "Receitas" do menu. Lá você pode visualizar, baixar em PDF ou compartilhar suas prescrições com farmácias autorizadas.',
    category: 'prescriptions',
  },
  {
    id: 5,
    question: 'Quanto tempo leva para meu pedido chegar?',
    answer: 'O prazo de entrega varia de acordo com sua localização. Em capitais, o prazo médio é de 2 a 5 dias úteis. Para outras regiões, pode levar de 5 a 10 dias úteis.',
    category: 'orders',
  },
  {
    id: 6,
    question: 'Como alterar minha senha?',
    answer: 'Acesse "Configurações" no menu, na seção "Segurança", clique em "Alterar senha". Você precisará informar sua senha atual e a nova senha desejada.',
    category: 'account',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Como podemos ajudar?</h1>
        <p className="text-slate-500">Encontre respostas rápidas ou entre em contato conosco.</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por dúvidas, tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              selectedCategory === category.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{category.icon}</span>
            <span className="text-sm font-medium text-center">{category.label}</span>
            <span className="text-xs text-slate-400">{category.count} artigos</span>
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredFaqs.map((faq) => (
                <div key={faq.id}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
              <p className="text-slate-500">Nenhuma pergunta encontrada</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Card */}
      <section className="bg-gradient-to-br from-primary to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Não encontrou o que procura?</h2>
            <p className="text-white/80">Nossa equipe está pronta para ajudar você.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
              <span className="material-symbols-outlined">chat</span>
              Chat ao Vivo
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
              <span className="material-symbols-outlined">call</span>
              WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h3 className="font-bold text-slate-900">Chat ao Vivo</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Converse em tempo real com nossa equipe de suporte.</p>
          <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            Iniciar Chat
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="material-symbols-outlined">call</span>
            </div>
            <h3 className="font-bold text-slate-900">WhatsApp</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">(11) 99999-9999 - Seg a Sex, 8h às 20h</p>
          <button className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
            Abrir WhatsApp
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <h3 className="font-bold text-slate-900">E-mail</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">suporte@canneo.com.br - Resposta em até 24h</p>
          <button className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
            Enviar E-mail
          </button>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">schedule</span>
          <h3 className="font-bold text-slate-900">Horário de Atendimento</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Segunda a Sexta</span>
            <span className="font-medium text-slate-900">08:00 - 20:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Sábado</span>
            <span className="font-medium text-slate-900">09:00 - 14:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Domingo e Feriados</span>
            <span className="font-medium text-slate-500">Fechado</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Chat (emergência)</span>
            <span className="font-medium text-green-600">24h disponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}
