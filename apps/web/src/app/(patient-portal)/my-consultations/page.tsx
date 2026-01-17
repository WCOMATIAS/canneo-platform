'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Clock } from 'lucide-react';

export default function MyConsultationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
        <p className="text-gray-500">Acompanhe suas consultas agendadas e realizadas</p>
      </div>

      {/* Próxima consulta */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calendar className="h-5 w-5" />
            Proxima Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-800 font-medium">Nenhuma consulta agendada</p>
            <p className="text-sm text-blue-600 mt-1">
              A clinica entrara em contato para agendar sua consulta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Historico de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma consulta realizada
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Seu historico de consultas aparecera aqui apos sua primeira teleconsulta.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Como funciona a teleconsulta?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              Voce recebera um link por email ou WhatsApp antes da consulta
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              No horario agendado, clique no link para entrar na sala de video
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              Tenha seus documentos e exames em maos para mostrar ao medico
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              Apos a consulta, sua prescricao estara disponivel neste portal
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
