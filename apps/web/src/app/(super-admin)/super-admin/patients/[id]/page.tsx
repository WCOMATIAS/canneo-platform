'use client';

import { use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Pill,
  FileCheck,
  Stethoscope,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Heart,
  Activity,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuperAdminPatient } from '@/hooks/use-super-admin';

function getPipelineStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    LEAD: { label: 'Lead', variant: 'outline' },
    FIRST_CONTACT: { label: 'Primeiro Contato', variant: 'secondary' },
    SCHEDULING: { label: 'Agendando', variant: 'secondary' },
    WAITING_CONSULTATION: { label: 'Aguardando Consulta', variant: 'default' },
    IN_TREATMENT: { label: 'Em Tratamento', variant: 'default' },
    FOLLOW_UP: { label: 'Acompanhamento', variant: 'default' },
    INACTIVE: { label: 'Inativo', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

function getConsultationStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    SCHEDULED: { label: 'Agendada', variant: 'secondary' },
    CONFIRMED: { label: 'Confirmada', variant: 'default' },
    IN_PROGRESS: { label: 'Em Andamento', variant: 'default' },
    COMPLETED: { label: 'Concluida', variant: 'default' },
    CANCELLED: { label: 'Cancelada', variant: 'destructive' },
    NO_SHOW: { label: 'Nao Compareceu', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

function getDocumentTypeBadge(type: string) {
  const typeMap: Record<string, { label: string; color: string }> = {
    RG: { label: 'RG', color: 'bg-blue-500' },
    CPF: { label: 'CPF', color: 'bg-green-500' },
    CNH: { label: 'CNH', color: 'bg-purple-500' },
    COMPROVANTE_RESIDENCIA: { label: 'Comp. Residencia', color: 'bg-orange-500' },
    SELFIE: { label: 'Selfie', color: 'bg-pink-500' },
    RECEITA_MEDICA: { label: 'Receita Medica', color: 'bg-red-500' },
    LAUDO_MEDICO: { label: 'Laudo Medico', color: 'bg-yellow-500' },
    OTHER: { label: 'Outro', color: 'bg-gray-500' },
  };

  const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-500' };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${typeInfo.color}`}>
      {typeInfo.label}
    </span>
  );
}

export default function SuperAdminPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: patient, isLoading, error } = useSuperAdminPatient(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Erro ao carregar paciente</p>
          <Link href="/super-admin/patients">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/patients">
            <Button variant="outline" size="sm" className="border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
              {getPipelineStatusBadge(patient.pipelineStatus)}
            </div>
            <p className="text-gray-400 mt-1">
              CPF: ***.***.***-{patient.cpfLastFour} | Cadastrado em {format(new Date(patient.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patient.stats.totalConsultations}</p>
                <p className="text-xs text-gray-400">Consultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900 rounded-lg flex items-center justify-center">
                <Pill className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patient.stats.totalPrescriptions}</p>
                <p className="text-xs text-gray-400">Prescricoes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-900 rounded-lg flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patient.stats.totalReports}</p>
                <p className="text-xs text-gray-400">Laudos ANVISA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patient.stats.totalRecords}</p>
                <p className="text-xs text-gray-400">Prontuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patient.documents.length}</p>
                <p className="text-xs text-gray-400">Docs KYC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="space-y-6">
          {/* Personal Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacoes Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{patient.phone}</span>
                </div>
              )}
              {patient.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">
                    {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                    {patient.gender && ` - ${patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : patient.gender}`}
                  </span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-gray-300">
                    {typeof patient.address === 'object'
                      ? `${patient.address.street || ''}, ${patient.address.number || ''} - ${patient.address.city || ''}, ${patient.address.state || ''}`
                      : patient.address
                    }
                  </span>
                </div>
              )}
              {patient.organization && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{patient.organization.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {patient.organization.type}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informacoes Medicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Alergias</p>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhuma alergia informada</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Condicoes</p>
                {patient.conditions && patient.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhuma condicao informada</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Medicamentos em Uso</p>
                {patient.medications && patient.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medications.map((med, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Pill className="h-3 w-3 mr-1" />
                        {med}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum medicamento informado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KYC Documents */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos KYC
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.documents.length > 0 ? (
                <div className="space-y-3">
                  {patient.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getDocumentTypeBadge(doc.type)}
                            <span className="text-xs text-gray-500">
                              {format(new Date(doc.uploadedAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhum documento enviado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="consultations" className="space-y-4">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="consultations" className="data-[state=active]:bg-gray-700">
                Consultas
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="data-[state=active]:bg-gray-700">
                Prescricoes
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700">
                Laudos ANVISA
              </TabsTrigger>
              <TabsTrigger value="records" className="data-[state=active]:bg-gray-700">
                Prontuarios
              </TabsTrigger>
            </TabsList>

            {/* Consultations Tab */}
            <TabsContent value="consultations">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Historico de Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.consultations.length > 0 ? (
                    <div className="space-y-4">
                      {patient.consultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {format(new Date(consultation.scheduledAt), "dd/MM/yyyy 'as' HH:mm")}
                              </p>
                              <p className="text-sm text-gray-400">
                                Dr(a). {consultation.doctor.user.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{consultation.type}</Badge>
                            {getConsultationStatusBadge(consultation.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Nenhuma consulta realizada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Prescricoes</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {patient.prescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                              <Pill className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{prescription.productName}</p>
                              <p className="text-sm text-gray-400">
                                {prescription.dosage} | Dr(a). {prescription.doctor.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(prescription.createdAt), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={prescription.status === 'SIGNED' ? 'default' : 'secondary'}>
                            {prescription.status === 'SIGNED' ? 'Assinada' : prescription.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Nenhuma prescricao realizada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Laudos ANVISA</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.anvisaReports.length > 0 ? (
                    <div className="space-y-4">
                      {patient.anvisaReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-900 rounded-full flex items-center justify-center">
                              <FileCheck className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                Laudo ANVISA
                              </p>
                              <p className="text-sm text-gray-400">
                                Dr(a). {report.doctor.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={report.status === 'SIGNED' ? 'default' : 'secondary'}>
                            {report.status === 'SIGNED' ? 'Assinado' : report.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Nenhum laudo ANVISA gerado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Records Tab */}
            <TabsContent value="records">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Prontuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {patient.medicalRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {record.templateType === 'FIRST_CONSULTATION' ? 'Primeira Consulta' :
                                 record.templateType === 'FOLLOW_UP' ? 'Retorno' :
                                 record.templateType === 'ADJUSTMENT' ? 'Ajuste' : record.templateType}
                              </p>
                              <p className="text-sm text-gray-400">
                                Dr(a). {record.doctor.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(record.createdAt), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Nenhum prontuario registrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
