'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">Gerencie sua agenda de consultas</p>
        </div>
        <Button className="bg-canneo-600 hover:bg-canneo-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Agenda em construcao
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              O calendario de consultas esta sendo desenvolvido. Em breve voce podera
              visualizar e gerenciar todos os agendamentos aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
