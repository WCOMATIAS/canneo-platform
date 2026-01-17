'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Stethoscope,
  Users,
  Video,
  FileText,
  FileCheck,
  Mail,
  Phone,
  Building2,
  Clock,
  CreditCard,
  Activity,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  useSuperAdminDoctor,
  useSuperAdminDoctorPatients,
  useSuperAdminDoctorConsultations,
  useSuperAdminDoctorReports,
  useSuperAdminDoctorPrescriptions,
} from '@/hooks/use-super-admin';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientsPage, setPatientsPage] = useState(1);
  const [consultationsPage, setConsultationsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [prescriptionsPage, setPrescriptionsPage] = useState(1);

  const doctorId = params.id as string;

  const { data: doctor, isLoading: isLoadingDoctor, error: doctorError } = useSuperAdminDoctor(doctorId);
  const { data: patientsData, isLoading: isLoadingPatients } = useSuperAdminDoctorPatients(doctorId, { page: patientsPage, limit: 10 });
  const { data: consultationsData, isLoading: isLoadingConsultations } = useSuperAdminDoctorConsultations(doctorId, { page: consultationsPage, limit: 10 });
  const { data: reportsData, isLoading: isLoadingReports } = useSuperAdminDoctorReports(doctorId, { page: reportsPage, limit: 10 });
  const { data: prescriptionsData, isLoading: isLoadingPrescriptions } = useSuperAdminDoctorPrescriptions(doctorId, { page: prescriptionsPage, limit: 10 });

  if (isLoadingDoctor) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-400 mb-4">Erro ao carregar dados do medico</p>
        <Button onClick={() => router.back()} variant="outline" className="border-gray-600 text-gray-300">
          Voltar
        </Button>
      </div>
    );
  }

  const membership = doctor.user.memberships[0];
  const organization = membership?.organization;
  const subscription = organization ? (doctor as any).user?.memberships?.[0]?.organization?.subscriptions?.[0] : null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TRIAL: 'bg-yellow-900/50 text-yellow-400',
      ACTIVE: 'bg-green-900/50 text-green-400',
      PAST_DUE: 'bg-red-900/50 text-red-400',
      CANCELED: 'bg-gray-600 text-gray-400',
      SCHEDULED: 'bg-blue-900/50 text-blue-400',
      CONFIRMED: 'bg-cyan-900/50 text-cyan-400',
      COMPLETED: 'bg-green-900/50 text-green-400',
      IN_PROGRESS: 'bg-purple-900/50 text-purple-400',
      NO_SHOW: 'bg-red-900/50 text-red-400',
      DRAFT: 'bg-gray-600 text-gray-400',
      SIGNED: 'bg-green-900/50 text-green-400',
    };
    return colors[status] || 'bg-gray-600 text-gray-400';
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
          <h1 className="text-2xl font-bold text-white">{doctor.user.name}</h1>
          <p className="text-gray-400">
            CRM {doctor.crm}-{doctor.ufCrm} {doctor.specialty && `| ${doctor.specialty}`}
          </p>
        </div>
      </div>

      {/* Doctor Info Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                {doctor.user.avatarUrl ? (
                  <img src={doctor.user.avatarUrl} alt={doctor.user.name} className="w-20 h-20 rounded-full" />
                ) : (
                  <Stethoscope className="h-10 w-10 text-blue-300" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{doctor.user.name}</h2>
                <p className="text-gray-400">{doctor.specialty || 'Especialidade nao informada'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {subscription && (
                    <>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status === 'TRIAL' ? 'Trial' : subscription.status === 'ACTIVE' ? 'Ativo' : subscription.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Plano {subscription.plan?.name || 'N/A'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{doctor.user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{doctor.user.phone || 'Nao informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{organization?.name || 'Sem organizacao'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Ultimo acesso: {formatDateTime(doctor.user.lastLoginAt)}</span>
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
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{doctor.stats.totalPatients}</p>
              <p className="text-sm text-gray-400">Pacientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{doctor.stats.totalConsultations}</p>
              <p className="text-sm text-gray-400">Consultas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{doctor.stats.totalReports}</p>
              <p className="text-sm text-gray-400">Laudos ANVISA</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{doctor.stats.totalPrescriptions}</p>
              <p className="text-sm text-gray-400">Prescricoes</p>
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
            value="patients"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Pacientes ({doctor.stats.totalPatients})
          </TabsTrigger>
          <TabsTrigger
            value="consultations"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Consultas ({doctor.stats.totalConsultations})
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Laudos ({doctor.stats.totalReports})
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
          >
            Prescricoes ({doctor.stats.totalPrescriptions})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  Organizacao
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nome</span>
                  <span className="text-white">{organization?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo</span>
                  <span className="text-white">{organization?.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slug</span>
                  <span className="text-white">{organization?.slug || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-400" />
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={subscription ? getStatusColor(subscription.status).replace('bg-', 'text-').split(' ')[1] : 'text-gray-400'}>
                    {subscription?.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plano</span>
                  <span className="text-white">{subscription?.plan?.name || 'N/A'}</span>
                </div>
                {subscription?.trialEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trial expira em</span>
                    <span className="text-white">{formatDate(subscription.trialEndsAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultations by Status */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Consultas por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(doctor.stats.consultationsByStatus || {}).length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhuma consulta registrada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(doctor.stats.consultationsByStatus || {}).map(([status, count]) => (
                      <div key={status} className="text-center p-3 bg-gray-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-white">{count as number}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pacientes do Medico</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPatients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : !patientsData?.patients.length ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum paciente cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientsData.patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-400">
                          {patient.email || 'Email nao informado'} | CPF ***{patient.cpfLastFour}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-300">{patient.stats.consultations} consultas</p>
                          <p className="text-gray-400">{patient.stats.prescriptions} prescricoes</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {patientsData.pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={patientsPage === 1}
                        onClick={() => setPatientsPage(p => p - 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4 text-gray-400">
                        {patientsPage} / {patientsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={patientsPage === patientsData.pagination.totalPages}
                        onClick={() => setPatientsPage(p => p + 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Proxima
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Consultas do Medico</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingConsultations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : !consultationsData?.consultations.length ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma consulta realizada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultationsData.consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{consultation.patient.name}</p>
                        <p className="text-sm text-gray-400">
                          {formatDateTime(consultation.scheduledAt)} | {consultation.type}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                  ))}

                  {consultationsData.pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={consultationsPage === 1}
                        onClick={() => setConsultationsPage(p => p - 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4 text-gray-400">
                        {consultationsPage} / {consultationsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={consultationsPage === consultationsData.pagination.totalPages}
                        onClick={() => setConsultationsPage(p => p + 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Proxima
                      </Button>
                    </div>
                  )}
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
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : !reportsData?.reports.length ? (
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum laudo emitido</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportsData.reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{report.patient.name}</p>
                        <p className="text-sm text-gray-400">
                          {formatDate(report.createdAt)} | {report.prescription?.productName || 'N/A'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  ))}

                  {reportsData.pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reportsPage === 1}
                        onClick={() => setReportsPage(p => p - 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4 text-gray-400">
                        {reportsPage} / {reportsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reportsPage === reportsData.pagination.totalPages}
                        onClick={() => setReportsPage(p => p + 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Proxima
                      </Button>
                    </div>
                  )}
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
              {isLoadingPrescriptions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : !prescriptionsData?.prescriptions.length ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma prescricao emitida</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptionsData.prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{prescription.patient.name}</p>
                        <p className="text-sm text-gray-400">
                          {prescription.productName} - {prescription.dosage}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {prescriptionsData.pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={prescriptionsPage === 1}
                        onClick={() => setPrescriptionsPage(p => p - 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4 text-gray-400">
                        {prescriptionsPage} / {prescriptionsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={prescriptionsPage === prescriptionsData.pagination.totalPages}
                        onClick={() => setPrescriptionsPage(p => p + 1)}
                        className="border-gray-600 text-gray-300"
                      >
                        Proxima
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
