'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Book, Video, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajuda</h1>
        <p className="text-gray-500">Central de suporte e documentacao</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Book className="h-12 w-12 text-canneo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Documentacao</h3>
            <p className="text-sm text-gray-500 mb-4">
              Aprenda a usar todas as funcionalidades da plataforma
            </p>
            <Button variant="outline" className="w-full">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 text-canneo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutoriais</h3>
            <p className="text-sm text-gray-500 mb-4">
              Assista tutoriais em video para aprender mais rapido
            </p>
            <Button variant="outline" className="w-full">
              Assistir
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-canneo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
            <p className="text-sm text-gray-500 mb-4">
              Perguntas frequentes e respostas rapidas
            </p>
            <Button variant="outline" className="w-full">
              Ver FAQ
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-canneo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Chat de Suporte</h3>
            <p className="text-sm text-gray-500 mb-4">
              Converse com nossa equipe em tempo real
            </p>
            <Button variant="outline" className="w-full">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-canneo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-500 mb-4">
              Envie um email para nossa equipe de suporte
            </p>
            <Button variant="outline" className="w-full">
              suporte@canneo.com.br
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o CANNEO</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            O CANNEO e uma plataforma de telemedicina especializada em cannabis medicinal,
            desenvolvida para facilitar o atendimento de pacientes e a emissao de laudos
            para autorizacao ANVISA.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Versao 1.0.0 - MVP
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
