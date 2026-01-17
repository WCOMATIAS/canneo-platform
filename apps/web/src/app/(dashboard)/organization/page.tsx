'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Settings, MapPin } from 'lucide-react';

export default function OrganizationPage() {
  const { membership } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizacao</h1>
          <p className="text-gray-500">Configuracoes da sua clinica</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Clinica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-gray-900">{membership?.organization?.name || 'Nao informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="text-gray-900">{membership?.organization?.slug || 'Nao informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo</label>
              <p className="text-gray-900">{membership?.organization?.type === 'CLINICA' ? 'Clinica' : 'Associacao'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Gerenciamento de equipe em breve</p>
              <Button variant="outline" className="mt-4" disabled>
                Convidar Membro
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Endereco nao cadastrado</p>
              <Button variant="outline" className="mt-4">
                Adicionar Endereco
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
