'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  MessageCircle,
  Book,
  Video,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// FAQ Data
const FAQ_ITEMS = [
  {
    question: 'Como cadastrar um novo paciente?',
    answer:
      'Para cadastrar um novo paciente, acesse o menu "Pacientes" e clique no botao "Novo Paciente". Preencha os dados obrigatorios como nome, CPF, email, telefone e data de nascimento. Os campos de endereco e informacoes medicas sao opcionais, mas recomendamos preencher para ter um cadastro completo.',
  },
  {
    question: 'Como gerar um laudo ANVISA?',
    answer:
      'Primeiro, certifique-se de que o paciente tem um prontuario completo. Em seguida, acesse o menu "Laudos ANVISA" e clique em "Novo Laudo". Selecione o paciente, preencha o diagnostico com o codigo CID-10, a justificativa clinica e as informacoes do produto solicitado. O laudo sera gerado automaticamente no formato exigido pela ANVISA.',
  },
  {
    question: 'Como funciona a teleconsulta?',
    answer:
      'Apos agendar uma consulta, no horario marcado voce vera um botao "Iniciar" na lista de consultas. Ao clicar, uma sala de video sera criada automaticamente. O paciente recebera um link por email para acessar a consulta. A plataforma utiliza criptografia de ponta a ponta para garantir a privacidade.',
  },
  {
    question: 'Posso editar um prontuario depois de salvo?',
    answer:
      'Sim, voce pode editar prontuarios a qualquer momento. Todas as alteracoes sao registradas no historico com data, hora e usuario que fez a modificacao, mantendo a rastreabilidade exigida pelos orgaos reguladores.',
  },
  {
    question: 'Como convidar outros profissionais para minha clinica?',
    answer:
      'Acesse o menu "Organizacao" e clique em "Convidar Membro". Informe o email do profissional e selecione o papel (Administrador, Medico, Secretario ou Visualizador). O profissional recebera um email com instrucoes para criar sua conta.',
  },
  {
    question: 'Meus dados estao seguros?',
    answer:
      'Sim, o CANNEO segue as melhores praticas de seguranca. Todos os dados sao criptografados em transito e em repouso. A plataforma esta em conformidade com a LGPD e as exigencias do CFM para prontuarios eletronicos.',
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showAllFaq, setShowAllFaq] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleOpenDocs = () => {
    // Em producao, abriria a documentacao externa
    window.open('https://docs.canneo.com.br', '_blank');
  };

  const handleOpenTutorials = () => {
    // Em producao, abriria os tutoriais em video
    window.open('https://youtube.com/@canneo', '_blank');
  };

  const handleStartChat = () => {
    toast({
      title: 'Chat de suporte',
      description: 'O chat de suporte sera aberto em uma nova janela.',
    });
    // Em producao, abriria o widget de chat (ex: Intercom, Zendesk)
    // window.Intercom?.('show');
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:suporte@canneo.com.br?subject=Suporte%20CANNEO';
  };

  const displayedFaq = showAllFaq ? FAQ_ITEMS : FAQ_ITEMS.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajuda</h1>
        <p className="text-gray-500">Central de suporte e documentacao</p>
      </div>

      {/* Cards de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleOpenDocs}
        >
          <CardContent className="p-6 text-center">
            <Book className="h-10 w-10 text-canneo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Documentacao</h3>
            <p className="text-sm text-gray-500 mb-3">
              Guias e tutoriais completos
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3 w-3 mr-2" />
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleOpenTutorials}
        >
          <CardContent className="p-6 text-center">
            <Video className="h-10 w-10 text-canneo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Video Tutoriais</h3>
            <p className="text-sm text-gray-500 mb-3">
              Aprenda assistindo
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3 w-3 mr-2" />
              Assistir
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleStartChat}
        >
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-10 w-10 text-canneo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Chat de Suporte</h3>
            <p className="text-sm text-gray-500 mb-3">
              Atendimento em tempo real
            </p>
            <Button className="w-full bg-canneo-600 hover:bg-canneo-700" size="sm">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleEmailSupport}
        >
          <CardContent className="p-6 text-center">
            <Mail className="h-10 w-10 text-canneo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-sm text-gray-500 mb-3">
              suporte@canneo.com.br
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Enviar Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-canneo-600" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedFaq.map((item, index) => (
            <div key={index} className="border rounded-lg">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-gray-600 text-sm">
                  {item.answer}
                </div>
              )}
            </div>
          ))}

          {FAQ_ITEMS.length > 4 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAllFaq(!showAllFaq)}
                className="text-canneo-600"
              >
                {showAllFaq ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Ver todas as {FAQ_ITEMS.length} perguntas
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contato Direto */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de mais ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Phone className="h-5 w-5 text-canneo-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Telefone</p>
                <p className="text-sm text-gray-500">(11) 9999-9999</p>
                <p className="text-xs text-gray-400">Seg a Sex, 9h as 18h</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Mail className="h-5 w-5 text-canneo-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">suporte@canneo.com.br</p>
                <p className="text-xs text-gray-400">Resposta em ate 24h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sobre */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o CANNEO</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            O CANNEO e uma plataforma de telemedicina especializada em cannabis medicinal,
            desenvolvida para facilitar o atendimento de pacientes e a emissao de laudos
            para autorizacao ANVISA. Nossa missao e democratizar o acesso a tratamentos
            com cannabis medicinal de forma segura e regulamentada.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span>Versao 1.0.0 - MVP</span>
            <span>•</span>
            <a href="#" className="text-canneo-600 hover:underline">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="#" className="text-canneo-600 hover:underline">
              Politica de Privacidade
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
