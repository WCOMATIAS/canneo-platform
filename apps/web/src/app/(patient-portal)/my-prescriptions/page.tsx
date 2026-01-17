'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle } from 'lucide-react';

export default function MyPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Prescricoes</h1>
        <p className="text-gray-500">Acesse suas prescricoes e laudos medicos</p>
      </div>

      {/* Alerta informativo */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Importante</p>
            <p className="text-sm text-amber-700">
              As prescricoes de cannabis medicinal tem validade de 6 meses.
              Acompanhe a data de validade para renovar a tempo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prescrições ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prescricoes Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma prescricao ativa
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Suas prescricoes aparecerao aqui apos a consulta medica.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Prescricoes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma prescricao anterior</p>
          </div>
        </CardContent>
      </Card>

      {/* Info sobre ANVISA */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Sobre a autorizacao ANVISA</h3>
          <p className="text-sm text-gray-600 mb-4">
            Para importar produtos a base de cannabis, e necessario obter autorizacao
            da ANVISA. O processo inclui:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Laudo medico justificando o tratamento
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Prescricao com dosagem e produto especifico
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Documentos pessoais (RG, CPF, comprovante de residencia)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Termo de responsabilidade assinado
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
