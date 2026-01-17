'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, ClipboardList } from 'lucide-react';

export default function MedicalRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuarios</h1>
          <p className="text-gray-500">Prontuarios eletronicos dos pacientes</p>
        </div>
        <Button className="bg-canneo-600 hover:bg-canneo-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Prontuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuarios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum prontuario cadastrado
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Os prontuarios serao criados automaticamente apos as consultas.
              Voce tambem pode criar um prontuario manualmente.
            </p>
            <Button className="mt-4 bg-canneo-600 hover:bg-canneo-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Prontuario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
