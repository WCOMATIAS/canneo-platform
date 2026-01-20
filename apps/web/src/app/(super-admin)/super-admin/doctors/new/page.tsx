'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Stethoscope,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  MapPin,
} from 'lucide-react';
import { useSuperAdminOrganizations } from '@/hooks/use-super-admin';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SPECIALTIES = [
  'Clínico Geral',
  'Neurologia',
  'Psiquiatria',
  'Oncologia',
  'Dor Crônica',
  'Geriatria',
  'Pediatria',
  'Reumatologia',
  'Medicina Integrativa',
  'Outras',
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  crm: string;
  ufCrm: string;
  specialty: string;
  organizationId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  crm?: string;
  ufCrm?: string;
  specialty?: string;
  organizationId?: string;
}

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    crm: '',
    ufCrm: '',
    specialty: '',
    organizationId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: organizationsData, isLoading: isLoadingOrgs } = useSuperAdminOrganizations({ page: 1, limit: 100 });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.crm.trim()) {
      newErrors.crm = 'CRM é obrigatório';
    } else if (!/^\d+$/.test(formData.crm)) {
      newErrors.crm = 'CRM deve conter apenas números';
    }

    if (!formData.ufCrm) {
      newErrors.ufCrm = 'UF do CRM é obrigatório';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Especialidade é obrigatória';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organização é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulando chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Implementar chamada real à API
      // await createDoctor(formData);

      router.push('/super-admin/doctors');
    } catch (error) {
      console.error('Erro ao criar médico:', error);
      setErrors({ name: 'Erro ao criar médico. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Médico</h1>
          <p className="text-gray-400">Cadastre um novo médico no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Nome Completo *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Dr. João Silva"
                    className={`pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="medico@exemplo.com"
                    className={`pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Profissionais */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-400" />
                Dados Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crm" className="text-gray-300">
                    CRM *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="crm"
                      value={formData.crm}
                      onChange={(e) => handleChange('crm', e.target.value)}
                      placeholder="123456"
                      className={`pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 ${
                        errors.crm ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.crm && (
                    <p className="text-sm text-red-400">{errors.crm}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ufCrm" className="text-gray-300">
                    UF do CRM *
                  </Label>
                  <Select
                    value={formData.ufCrm}
                    onValueChange={(value) => handleChange('ufCrm', value)}
                  >
                    <SelectTrigger
                      className={`bg-gray-700 border-gray-600 text-white ${
                        errors.ufCrm ? 'border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="UF" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {UF_OPTIONS.map((uf) => (
                        <SelectItem
                          key={uf}
                          value={uf}
                          className="text-white hover:bg-gray-600"
                        >
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ufCrm && (
                    <p className="text-sm text-red-400">{errors.ufCrm}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-gray-300">
                  Especialidade *
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange('specialty', value)}
                >
                  <SelectTrigger
                    className={`bg-gray-700 border-gray-600 text-white ${
                      errors.specialty ? 'border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Selecione a especialidade" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem
                        key={specialty}
                        value={specialty}
                        className="text-white hover:bg-gray-600"
                      >
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialty && (
                  <p className="text-sm text-red-400">{errors.specialty}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organização */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationId" className="text-gray-300">
                  Vincular a Organização *
                </Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => handleChange('organizationId', value)}
                  disabled={isLoadingOrgs}
                >
                  <SelectTrigger
                    className={`bg-gray-700 border-gray-600 text-white ${
                      errors.organizationId ? 'border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder={isLoadingOrgs ? 'Carregando...' : 'Selecione a organização'} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {organizationsData?.organizations.map((org) => (
                      <SelectItem
                        key={org.id}
                        value={org.id}
                        className="text-white hover:bg-gray-600"
                      >
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organizationId && (
                  <p className="text-sm text-red-400">{errors.organizationId}</p>
                )}
                <p className="text-sm text-gray-500">
                  O médico será vinculado a esta organização e terá acesso ao sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Médico
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
