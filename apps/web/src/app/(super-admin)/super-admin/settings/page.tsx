'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  CreditCard,
  Mail,
  Shield,
  Database,
  Bell,
  FileText,
  Loader2,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useSuperAdminPlans, Plan } from '@/hooks/use-super-admin';
import { toast } from '@/hooks/use-toast';

function formatCurrency(value: number | null | undefined) {
  if (value == null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  maxDoctors: string;
  maxPatients: string;
  maxStorageGb: string;
  features: string;
  isActive: boolean;
}

const initialPlanFormData: PlanFormData = {
  name: '',
  slug: '',
  description: '',
  monthlyPrice: '',
  yearlyPrice: '',
  maxDoctors: '1',
  maxPatients: '100',
  maxStorageGb: '5',
  features: '',
  isActive: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General settings state
  const [platformName, setPlatformName] = useState('CANNEO');
  const [supportEmail, setSupportEmail] = useState('suporte@canneo.com.br');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserRegistration, setNewUserRegistration] = useState(true);

  // Email settings state
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [senderEmail, setSenderEmail] = useState('noreply@canneo.com.br');
  const [senderName, setSenderName] = useState('CANNEO');

  // Plan modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [planFormData, setPlanFormData] = useState<PlanFormData>(initialPlanFormData);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const { data: plans, isLoading: isLoadingPlans } = useSuperAdminPlans();

  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanFormData(initialPlanFormData);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      monthlyPrice: String(plan.monthlyPrice / 100),
      yearlyPrice: String(plan.yearlyPrice / 100),
      maxDoctors: plan.maxDoctors === -1 ? 'Ilimitado' : String(plan.maxDoctors),
      maxPatients: plan.maxPatients === -1 ? 'Ilimitado' : String(plan.maxPatients),
      maxStorageGb: String(plan.maxStorageGb),
      features: plan.features.join('\n'),
      isActive: plan.isActive,
    });
    setIsPlanModalOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setDeletingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    try {
      // TODO: Implement API call to create/update plan
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: editingPlan ? 'Plano atualizado' : 'Plano criado',
        description: editingPlan
          ? 'O plano foi atualizado com sucesso.'
          : 'O novo plano foi criado com sucesso.',
      });

      setIsPlanModalOpen(false);
      setPlanFormData(initialPlanFormData);
      setEditingPlan(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o plano.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
      // TODO: Implement API call to delete plan
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Plano excluido',
        description: 'O plano foi excluido com sucesso.',
      });

      setIsDeleteDialogOpen(false);
      setDeletingPlan(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o plano.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Configuracoes salvas',
        description: 'As configuracoes foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configuracoes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracoes</h1>
          <p className="text-gray-400">Gerencie as configuracoes gerais da plataforma</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            <Shield className="h-4 w-4 mr-2" />
            Seguranca
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Configuracoes Gerais</CardTitle>
              <CardDescription className="text-gray-400">
                Configure as opcoes basicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Nome da Plataforma</label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email de Suporte</label>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Modo de Manutencao</p>
                    <p className="text-sm text-gray-400">Desativa o acesso ao sistema para usuarios</p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Cadastro de Novos Usuarios</p>
                    <p className="text-sm text-gray-400">Permite que novos usuarios se cadastrem</p>
                  </div>
                  <Switch
                    checked={newUserRegistration}
                    onCheckedChange={setNewUserRegistration}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Alteracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Settings */}
        <TabsContent value="plans" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Gerenciamento de Planos</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure os planos disponiveis na plataforma
                </CardDescription>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={openCreatePlanModal}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : plans && plans.length > 0 ? (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-700/50 rounded-lg gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{plan.name}</h3>
                          <Badge variant="outline" className={plan.isActive ? 'border-green-700 text-green-400' : 'border-gray-500 text-gray-400'}>
                            {plan.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                          <span>Max Medicos: {plan.maxDoctors}</span>
                          <span>Max Pacientes: {plan.maxPatients}</span>
                          <span>Storage: {plan.maxStorageGb}GB</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-semibold">{formatCurrency(plan.monthlyPrice)}/mes</p>
                          <p className="text-sm text-gray-400">{formatCurrency(plan.yearlyPrice)}/ano</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                            onClick={() => openEditPlanModal(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400"
                            onClick={() => openDeleteDialog(plan)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum plano cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Configuracoes de Email</CardTitle>
              <CardDescription className="text-gray-400">
                Configure o servidor SMTP para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Servidor SMTP</label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.exemplo.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Porta</label>
                  <Input
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Usuario SMTP</label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Senha SMTP</label>
                  <Input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Remetente</label>
                  <Input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Nome Remetente</label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email de Teste
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Configuracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Configuracoes de Seguranca</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie as opcoes de seguranca da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Autenticacao de Dois Fatores (MFA)</p>
                  <p className="text-sm text-gray-400">Exigir MFA para todos os usuarios</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Expiracao de Sessao</p>
                  <p className="text-sm text-gray-400">Deslogar usuarios inativos apos 30 minutos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Bloqueio por Tentativas Falhas</p>
                  <p className="text-sm text-gray-400">Bloquear conta apos 5 tentativas de login falhas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Requisitos de Senha Forte</p>
                  <p className="text-sm text-gray-400">Exigir senhas com minimo de 8 caracteres, maiusculas e numeros</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Log de Atividades</p>
                  <p className="text-sm text-gray-400">Registrar todas as acoes dos usuarios</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Configuracoes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup de Dados
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie os backups do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg mb-4">
                <div>
                  <p className="font-medium text-white">Ultimo Backup</p>
                  <p className="text-sm text-gray-400">19/01/2026 03:00 - Automatico</p>
                </div>
                <Badge variant="outline" className="border-green-700 text-green-400">
                  <Check className="h-3 w-3 mr-1" />
                  Sucesso
                </Badge>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Database className="h-4 w-4 mr-2" />
                  Criar Backup Agora
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Historico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Create/Edit Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingPlan
                ? 'Atualize as informacoes do plano'
                : 'Preencha as informacoes do novo plano'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name" className="text-gray-300">Nome do Plano</Label>
                <Input
                  id="plan-name"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: STARTER"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-slug" className="text-gray-300">Slug</Label>
                <Input
                  id="plan-slug"
                  value={planFormData.slug}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Ex: starter"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description" className="text-gray-300">Descricao</Label>
              <Textarea
                id="plan-description"
                value={planFormData.description}
                onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descricao do plano..."
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-monthly" className="text-gray-300">Preco Mensal (R$)</Label>
                <Input
                  id="plan-monthly"
                  type="number"
                  value={planFormData.monthlyPrice}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, monthlyPrice: e.target.value }))}
                  placeholder="99.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-yearly" className="text-gray-300">Preco Anual (R$)</Label>
                <Input
                  id="plan-yearly"
                  type="number"
                  value={planFormData.yearlyPrice}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, yearlyPrice: e.target.value }))}
                  placeholder="990.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-doctors" className="text-gray-300">Max Medicos</Label>
                <Input
                  id="plan-doctors"
                  value={planFormData.maxDoctors}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, maxDoctors: e.target.value }))}
                  placeholder="5 ou Ilimitado"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-patients" className="text-gray-300">Max Pacientes</Label>
                <Input
                  id="plan-patients"
                  value={planFormData.maxPatients}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, maxPatients: e.target.value }))}
                  placeholder="500 ou Ilimitado"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-storage" className="text-gray-300">Storage (GB)</Label>
                <Input
                  id="plan-storage"
                  type="number"
                  value={planFormData.maxStorageGb}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, maxStorageGb: e.target.value }))}
                  placeholder="20"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-features" className="text-gray-300">Features (uma por linha)</Label>
              <Textarea
                id="plan-features"
                value={planFormData.features}
                onChange={(e) => setPlanFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Ate 5 medicos&#10;Ate 500 pacientes&#10;Suporte prioritario"
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Plano Ativo</p>
                <p className="text-sm text-gray-400">Disponivel para novas assinaturas</p>
              </div>
              <Switch
                checked={planFormData.isActive}
                onCheckedChange={(checked) => setPlanFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPlanModalOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={isSavingPlan}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSavingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPlan ? 'Atualizar Plano' : 'Criar Plano'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Excluir Plano
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o plano <strong className="text-white">{deletingPlan?.name}</strong>?
              Esta acao nao pode ser desfeita e pode afetar assinaturas existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Plano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
