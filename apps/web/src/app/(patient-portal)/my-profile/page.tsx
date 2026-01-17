'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Shield, Edit } from 'lucide-react';

export default function MyProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500">Gerencie suas informacoes pessoais</p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome Completo</label>
              <p className="text-gray-900">Nao informado</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CPF</label>
              <p className="text-gray-900">***.***.***-**</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
              <p className="text-gray-900">Nao informado</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Genero</label>
              <p className="text-gray-900">Nao informado</p>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email || 'Nao informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone</label>
              <p className="text-gray-900">Nao informado</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">WhatsApp</label>
              <p className="text-gray-900">Nao informado</p>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Endereco nao cadastrado</p>
              <Button variant="outline" className="mt-3" size="sm">
                Adicionar Endereco
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguranca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alterar Senha</p>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Verificacao em 2 etapas</p>
                <p className="text-sm text-gray-500">Proteja sua conta</p>
              </div>
              <Button variant="outline" size="sm">
                Ativar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
