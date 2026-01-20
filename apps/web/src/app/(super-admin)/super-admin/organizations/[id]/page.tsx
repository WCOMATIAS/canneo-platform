'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Users,
  Stethoscope,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Activity,
  DollarSign,
  Eye,
  Loader2,
  AlertCircle,
  Video,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { useSuperAdminOrganization } from '@/hooks/use-super-admin';

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    TRIAL: { label: 'Trial', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    ACTIVE: { label: 'Ativo', className: 'bg-green-900/50 text-green-400 border-green-700' },
    PAST_DUE: { label: 'Inadimplente', className: 'bg-red-900/50 text-red-400 border-red-700' },
    CANCELED: { label: 'Cancelado', className: 'bg-gray-600 text-gray-300 border-gray-500' },
    EXPIRED: { label: 'Expirado', className: 'bg-gray-600 text-gray-300 border-gray-500' },
  };
  const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-600 text-gray-300' };
  return (
    <Badge variant="outline" className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
}

function getRoleBadge(role: string) {
  const roleMap: Record<string, { label: string; className: string }> = {
    ADMIN: { label: 'Admin', className: 'bg-purple-900/50 text-purple-400 border-purple-700' },
    DOCTOR: { label: 'Medico', className: 'bg-blue-900/50 text-blue-400 border-blue-700' },
    SECRETARY: { label: 'Secretaria', className: 'bg-green-900/50 text-green-400 border-green-700' },
    VIEWER: { label: 'Visualizador', className: 'bg-gray-600 text-gray-300 border-gray-500' },
  };
  const roleInfo = roleMap[role] || { label: role, className: 'bg-gray-600 text-gray-300' };
  return (
    <Badge variant="outline" className={roleInfo.className}>
      {roleInfo.label}
    </Badge>
  );
}

function getTypeBadge(type: string) {
  const typeMap: Record<string, string> = {
    CLINIC: 'Clinica',
    HOSPITAL: 'Hospital',
    PRACTICE: 'Consultorio',
    OTHER: 'Outro',
    CLINICA: 'Clinica',
    ASSOCIACAO: 'Associacao',
  };
  return typeMap[type] || type;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function formatDate(date: string | null) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date: string | null) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('pt-BR');
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const organizationId = params.id as string;

  const { data: organization, isLoading, error } = useSuperAdminOrganization(organizationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4">Erro ao carregar dados da organizacao</p>
        <Button onClick={() => router.back()} variant="outline" className="border-gray-600 text-gray-300">
          Voltar
        </Button>
      </div>
    );
  }

  const subscription = organization.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
            {subscription && getStatusBadge(subscription.status)}
          </div>
          <p className="text-gray-400">
            /{organization.slug} | {getTypeBadge(organization.type)}
          </p>
        </div>
      </div>

      {/* Organization Info Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Logo and Basic Info */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-purple-900 rounded-lg flex items-center justify-center">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-purple-300" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{organization.name}</h2>
                <p className="text-gray-400">{getTypeBadge(organization.type)}</p>
                {organization.cnpj && (
                  <p className="text-sm text-gray-500 mt-1">CNPJ: {organization.cnpj}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {subscription?.plan && (
                    <Badge variant="outline" className="border-purple-700 text-purple-300">
                      {subscription.plan.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{organization.email || 'Nao informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{organization.phone || 'Nao informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Criado em: {formatDate(organization.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Atualizado: {formatDate(organization.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{organization._count?.doctors || 0}</p>
              <p className="text-sm text-gray-400">Medicos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{organization._count?.patients || 0}</p>
              <p className="text-sm text-gray-400">Pacientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{organization._count?.consultations || 0}</p>
              <p className="text-sm text-gray-400">Consultas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{organization._count?.memberships || 0}</p>
              <p className="text-sm text-gray-400">Membros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Visao Geral
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Membros ({organization.memberships?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Assinatura
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  Informacoes Basicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nome</span>
                  <span className="text-white">{organization.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slug</span>
                  <span className="text-white">/{organization.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo</span>
                  <span className="text-white">{getTypeBadge(organization.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CNPJ</span>
                  <span className="text-white">{organization.cnpj || 'Nao informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{organization.email || 'Nao informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telefone</span>
                  <span className="text-white">{organization.phone || 'Nao informado'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Address Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-400" />
                  Endereco
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization.address ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Logradouro</span>
                      <span className="text-white">
                        {organization.address.street}, {organization.address.number}
                      </span>
                    </div>
                    {organization.address.complement && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Complemento</span>
                        <span className="text-white">{organization.address.complement}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bairro</span>
                      <span className="text-white">{organization.address.neighborhood}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cidade/UF</span>
                      <span className="text-white">
                        {organization.address.city}/{organization.address.state}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CEP</span>
                      <span className="text-white">{organization.address.zipCode}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Endereco nao cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Metricas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <Stethoscope className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{organization._count?.doctors || 0}</p>
                    <p className="text-sm text-gray-400">Medicos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{organization._count?.patients || 0}</p>
                    <p className="text-sm text-gray-400">Pacientes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <Video className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{organization._count?.consultations || 0}</p>
                    <p className="text-sm text-gray-400">Consultas</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{organization._count?.memberships || 0}</p>
                    <p className="text-sm text-gray-400">Membros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Membros da Organizacao</CardTitle>
            </CardHeader>
            <CardContent>
              {!organization.memberships || organization.memberships.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum membro cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {organization.memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 font-semibold">
                            {membership.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{membership.user.name}</p>
                          <p className="text-sm text-gray-400">{membership.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(membership.role)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-400" />
                  Detalhes da Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plano</span>
                      <span className="text-white">{subscription.plan?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor Mensal</span>
                      <span className="text-white">
                        {formatCurrency(subscription.plan?.monthlyPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inicio do Periodo</span>
                      <span className="text-white">
                        {formatDate(subscription.currentPeriodStart)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fim do Periodo</span>
                      <span className="text-white">
                        {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    {subscription.trialEndsAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trial Expira</span>
                        <span className="text-yellow-400">
                          {formatDate(subscription.trialEndsAt)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Sem assinatura ativa</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Detalhes do Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription?.plan ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nome do Plano</span>
                      <Badge variant="outline" className="border-purple-700 text-purple-300">
                        {subscription.plan.name}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Medicos</span>
                      <span className="text-white">
                        {subscription.plan.maxDoctors === -1 ? 'Ilimitado' : subscription.plan.maxDoctors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Pacientes</span>
                      <span className="text-white">
                        {subscription.plan.maxPatients === -1 ? 'Ilimitado' : subscription.plan.maxPatients}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Medicos Cadastrados</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{organization._count?.doctors || 0}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-400">
                            {subscription.plan.maxDoctors === -1 ? '∞' : subscription.plan.maxDoctors}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: subscription.plan.maxDoctors === -1
                              ? '10%'
                              : `${Math.min(((organization._count?.doctors || 0) / subscription.plan.maxDoctors) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pacientes Cadastrados</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{organization._count?.patients || 0}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-400">
                            {subscription.plan.maxPatients === -1 ? '∞' : subscription.plan.maxPatients}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: subscription.plan.maxPatients === -1
                              ? '10%'
                              : `${Math.min(((organization._count?.patients || 0) / subscription.plan.maxPatients) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum plano associado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
