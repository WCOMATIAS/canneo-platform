'use client';

import { useState } from 'react';
import Link from 'next/link';

const benefits = [
  { icon: 'percent', title: 'Descontos exclusivos', description: 'Até 25% OFF em medicamentos' },
  { icon: 'calendar_month', title: 'Consultas reduzidas', description: 'Preço especial em teleconsultas' },
  { icon: 'local_shipping', title: 'Frete grátis', description: 'Em todos os pedidos do Marketplace' },
  { icon: 'priority_high', title: 'Atendimento prioritário', description: 'Suporte 24h dedicado' },
  { icon: 'autorenew', title: 'Renovação automática', description: 'Receitas renovadas sem burocracia' },
  { icon: 'loyalty', title: 'Pontos em dobro', description: 'Acumule mais pontos a cada compra' },
];

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.9,
    period: 'mês',
    description: 'Ideal para começar seu tratamento',
    features: [
      '10% de desconto em medicamentos',
      'Frete grátis acima de R$ 200',
      'Suporte por e-mail',
      'Acesso ao diário de tratamento',
    ],
    notIncluded: [
      'Consultas com desconto',
      'Renovação automática',
      'Atendimento prioritário',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.9,
    period: 'mês',
    description: 'O mais escolhido pelos pacientes',
    features: [
      '20% de desconto em medicamentos',
      'Frete grátis em todos os pedidos',
      '15% OFF em consultas',
      'Renovação automática de receitas',
      'Suporte prioritário 24h',
      'Pontos em dobro',
    ],
    notIncluded: [],
    popular: true,
  },
  {
    id: 'family',
    name: 'Familiar',
    price: 79.9,
    period: 'mês',
    description: 'Benefícios para toda a família',
    features: [
      'Tudo do Premium',
      'Até 4 dependentes inclusos',
      '25% de desconto em medicamentos',
      'Consultas familiares',
      'Gestor de saúde dedicado',
      'Relatórios personalizados',
    ],
    notIncluded: [],
    popular: false,
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Carlos Mendes',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    plan: 'Premium',
    text: 'O Clube de Saúde CANNEO transformou meu tratamento. Economia real e comodidade incomparável!',
  },
  {
    id: 2,
    name: 'Ana Paula Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    plan: 'Familiar',
    text: 'Toda minha família faz tratamento na CANNEO. O plano familiar foi a melhor decisão!',
  },
];

const faqs = [
  {
    question: 'Como funciona o cancelamento?',
    answer: 'Você pode cancelar a qualquer momento sem multa. O cancelamento é efetivado ao final do período já pago.',
  },
  {
    question: 'Os descontos são cumulativos com cupons?',
    answer: 'Sim! Os descontos do Clube podem ser combinados com cupons promocionais.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.',
  },
];

export default function ClubPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-primary via-teal-600 to-emerald-700 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative p-8 md:p-12">
          <span className="inline-block px-4 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 backdrop-blur-sm">
            Clube de Saúde CANNEO
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            Seu tratamento com<br />economia e comodidade
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mb-8">
            Assine o Clube de Saúde e tenha acesso a descontos exclusivos, frete grátis e muito mais benefícios.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#planos" className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors">
              Ver Planos
            </a>
            <button className="px-6 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
              Saiba Mais
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Benefícios do Clube</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-primary/10 text-primary rounded-lg inline-block mb-3">
                <span className="material-symbols-outlined">{benefit.icon}</span>
              </div>
              <h3 className="font-bold text-slate-900">{benefit.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="planos">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Escolha seu Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
                plan.popular ? 'border-primary shadow-xl' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-white text-xs font-bold uppercase rounded-bl-lg">
                  Mais Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-primary">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                  <span className="text-slate-500">/{plan.period}</span>
                </div>
                <Link
                  href={`/club/checkout?plan=${plan.id}`}
                  className={`mt-6 w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Assinar Agora
                </Link>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-3">Incluso no plano:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                      {feature}
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="material-symbols-outlined text-slate-300 text-lg">cancel</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Comparativo de Benefícios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Benefício</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">Básico</th>
                <th className="px-6 py-4 text-sm font-bold text-primary text-center bg-primary/5">Premium</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">Familiar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-4 text-sm text-slate-600">Desconto em medicamentos</td>
                <td className="px-6 py-4 text-center">10%</td>
                <td className="px-6 py-4 text-center bg-primary/5 font-bold text-primary">20%</td>
                <td className="px-6 py-4 text-center font-bold">25%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-600">Frete grátis</td>
                <td className="px-6 py-4 text-center text-slate-400">Acima de R$ 200</td>
                <td className="px-6 py-4 text-center bg-primary/5"><span className="material-symbols-outlined text-green-500">check</span></td>
                <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-green-500">check</span></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-600">Desconto em consultas</td>
                <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-slate-300">close</span></td>
                <td className="px-6 py-4 text-center bg-primary/5">15%</td>
                <td className="px-6 py-4 text-center font-bold">20%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-600">Dependentes</td>
                <td className="px-6 py-4 text-center"><span className="material-symbols-outlined text-slate-300">close</span></td>
                <td className="px-6 py-4 text-center bg-primary/5"><span className="material-symbols-outlined text-slate-300">close</span></td>
                <td className="px-6 py-4 text-center font-bold">Até 4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">O que nossos membros dizem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-primary">Membro {testimonial.plan}</p>
                </div>
              </div>
              <p className="text-slate-600 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Perguntas Frequentes</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {expandedFaq === index && (
                <div className="px-5 pb-5">
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
