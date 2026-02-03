'use client';

import { useState } from 'react';

const timelineSteps = [
  {
    id: 'submitted',
    title: 'Cadastro Enviado',
    description: 'Seus dados foram recebidos com sucesso',
    icon: 'check_circle',
    status: 'completed' as const,
  },
  {
    id: 'documents',
    title: 'Análise de Documentos',
    description: 'Verificando a autenticidade dos documentos enviados',
    icon: 'description',
    status: 'current' as const,
  },
  {
    id: 'crm',
    title: 'Validação do CRM',
    description: 'Consultando o registro no CFM/CRM estadual',
    icon: 'verified',
    status: 'pending' as const,
  },
  {
    id: 'approval',
    title: 'Aprovação Final',
    description: 'Revisão final pela equipe CANNEO',
    icon: 'task_alt',
    status: 'pending' as const,
  },
];

export default function PendingApprovalPage() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-8">
      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        {/* Icon */}
        <div className="size-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-amber-500">hourglass_top</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-slate-900 mb-2">Cadastro em Análise</h1>
        <p className="text-slate-500 max-w-sm mx-auto">
          Seu cadastro foi recebido e está sendo analisado pela nossa equipe. Você será notificado
          por e-mail assim que for aprovado.
        </p>

        {/* Estimated Time */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl inline-flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">schedule</span>
          <div className="text-left">
            <p className="text-xs text-slate-500">Tempo estimado de análise</p>
            <p className="text-sm font-bold text-slate-900">Até 48 horas úteis</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Status do Cadastro</h2>
        <div className="space-y-0">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === 'completed'
                      ? 'bg-emerald-100'
                      : step.status === 'current'
                        ? 'bg-amber-100'
                        : 'bg-slate-100'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      step.status === 'completed'
                        ? 'text-emerald-500'
                        : step.status === 'current'
                          ? 'text-amber-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.icon}
                  </span>
                </div>
                {index < timelineSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      step.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold ${
                      step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.status === 'current' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      Em andamento
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      Concluído
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    step.status === 'pending' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">help</span>
            <span className="font-semibold text-slate-900">Dúvidas Frequentes</span>
          </div>
          <span
            className={`material-symbols-outlined text-slate-400 transition-transform ${
              showHelp ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>
        {showHelp && (
          <div className="px-6 pb-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-semibold text-slate-900 text-sm">
                Quanto tempo leva a aprovação?
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                O processo de aprovação leva em média 24 a 48 horas úteis, dependendo da demanda e
                da verificação dos documentos.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-semibold text-slate-900 text-sm">
                Posso editar meus dados após enviar?
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                Durante a análise não é possível editar. Após a aprovação, você poderá atualizar suas
                informações no painel do médico.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-semibold text-slate-900 text-sm">
                O que acontece se meu cadastro for recusado?
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                Você receberá um e-mail explicando o motivo e poderá reenviar os documentos
                corrigidos.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
        <span className="material-symbols-outlined text-blue-500 shrink-0">support_agent</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Precisa de ajuda?</p>
          <p className="text-sm text-blue-700">
            Entre em contato com nosso suporte pelo e-mail{' '}
            <a href="mailto:suporte@canneo.com.br" className="font-semibold hover:underline">
              suporte@canneo.com.br
            </a>{' '}
            ou WhatsApp{' '}
            <a href="tel:+5511999999999" className="font-semibold hover:underline">
              (11) 99999-9999
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
