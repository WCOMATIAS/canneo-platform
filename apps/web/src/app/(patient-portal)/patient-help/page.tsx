'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileQuestion,
  Video,
  Pill,
  FileText,
  ChevronRight,
} from 'lucide-react';

const faqs = [
  {
    question: 'Como agendar uma consulta?',
    answer:
      'Voce pode agendar uma consulta diretamente pelo portal, na secao "Minhas Consultas". Escolha o medico, data e horario disponiveis.',
  },
  {
    question: 'Como funciona a teleconsulta?',
    answer:
      'No horario agendado, acesse a consulta pelo portal. Voce sera conectado por video com seu medico. Certifique-se de ter uma boa conexao de internet.',
  },
  {
    question: 'Como obter minha prescricao?',
    answer:
      'Apos a consulta, o medico emitira sua prescricao que ficara disponivel na secao "Minhas Prescricoes". Voce pode baixar o PDF a qualquer momento.',
  },
  {
    question: 'O que e o laudo ANVISA?',
    answer:
      'O laudo ANVISA e um documento medico necessario para solicitar autorizacao de importacao de produtos a base de cannabis. Seu medico emitira esse documento quando necessario.',
  },
  {
    question: 'Como solicitar autorizacao da ANVISA?',
    answer:
      'Seu medico preparara toda a documentacao necessaria. Voce recebera um pacote com todos os documentos para submeter no portal da ANVISA.',
  },
];

export default function PatientHelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Central de Ajuda</h1>
        <p className="text-gray-500">
          Encontre respostas para suas duvidas ou entre em contato conosco
        </p>
      </div>

      {/* Contato Rapido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Chat</h3>
                <p className="text-sm text-gray-500">Atendimento online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Telefone</h3>
                <p className="text-sm text-gray-500">(11) 9999-9999</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-sm text-gray-500">suporte@canneo.com.br</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Guias Rapidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Guias Rapidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-between h-auto py-4 px-4"
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-blue-600" />
                <span>Como usar a teleconsulta</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="justify-between h-auto py-4 px-4"
            >
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-green-600" />
                <span>Entendendo sua prescricao</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="justify-between h-auto py-4 px-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Processo ANVISA passo a passo</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="justify-between h-auto py-4 px-4"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <span>Primeiros passos no portal</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
