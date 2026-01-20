'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, Plus, ScrollText } from 'lucide-react';

export default function AnvisaReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laudos ANVISA</h1>
          <p className="text-gray-500">Laudos medicos para autorizacao ANVISA</p>
        </div>
        <Link href="/anvisa-reports/new">
          <Button className="bg-canneo-600 hover:bg-canneo-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Laudo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Laudos Emitidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ScrollText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum laudo emitido
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Os laudos ANVISA sao gerados para solicitar autorizacao de importacao
              de produtos a base de cannabis. Crie um laudo apos preencher o prontuario.
            </p>
            <Link href="/anvisa-reports/new">
              <Button className="mt-4 bg-canneo-600 hover:bg-canneo-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Laudo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
