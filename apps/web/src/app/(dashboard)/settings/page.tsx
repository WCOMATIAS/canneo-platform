'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';
import { ChangePasswordModal } from '@/components/modals/change-password-modal';

export default function SettingsPage() {
  const { user, doctorProfile } = useAuthStore();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-gray-500">Gerencie suas preferencias e conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-gray-900">{doctorProfile?.name || user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CRM</label>
              <p className="text-gray-900">{doctorProfile?.crm || '-'} / {doctorProfile?.ufCrm || '-'}</p>
            </div>
            <Link href="/settings/profile">
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>

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
                <p className="font-medium text-gray-900">Autenticacao 2FA</p>
                <p className="text-sm text-gray-500">Proteja sua conta com verificacao em duas etapas</p>
              </div>
              <Button variant="outline" size="sm">
                {user?.mfaEnabled ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alterar Senha</p>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsChangePasswordOpen(true)}>
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificacoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Configuracoes de notificacao em breve</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Palette className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Personalizacao em breve</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Alterar Senha */}
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </div>
  );
}
