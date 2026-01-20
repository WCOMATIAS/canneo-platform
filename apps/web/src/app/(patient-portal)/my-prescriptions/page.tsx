'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  usePatientPrescriptions,
  PRESCRIPTION_STATUS_LABELS,
} from '@/hooks/use-patient-portal';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysUntilExpiry(date: string) {
  const expiry = new Date(date);
  const now = new Date();
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function MyPrescriptionsPage() {
  const { data, isLoading } = usePatientPrescriptions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const prescriptions = data?.prescriptions || [];
  const activePrescriptions = prescriptions.filter((p) => p.isActive);
  const expiredPrescriptions = prescriptions.filter((p) => p.isExpired);
  const otherPrescriptions = prescriptions.filter((p) => !p.isActive && !p.isExpired);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Prescricoes</h1>
        <p className="text-gray-500">Acesse suas prescricoes e laudos medicos</p>
      </div>

      {/* Informative alert */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Importante</p>
            <p className="text-sm text-amber-700">
              As prescricoes de cannabis medicinal tem validade de 6 meses.
              Acompanhe a data de validade para renovar a tempo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Prescricoes Ativas ({activePrescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma prescricao ativa
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Suas prescricoes aparecerao aqui apos a consulta medica.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePrescriptions.map((prescription) => {
                const daysLeft = getDaysUntilExpiry(prescription.validUntil);
                const isExpiringSoon = daysLeft <= 30;

                return (
                  <div
                    key={prescription.id}
                    className={`border rounded-lg p-4 ${
                      isExpiringSoon ? 'border-amber-200 bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                          {isExpiringSoon && (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Vence em {daysLeft} dias
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {prescription.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {prescription.concentration}
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">Posologia:</span> {prescription.dosage}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Quantidade:</span> {prescription.quantity}
                          </p>
                          {prescription.instructions && (
                            <p className="text-gray-700">
                              <span className="font-medium">Instrucoes:</span> {prescription.instructions}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Dr(a). {prescription.doctor.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Valido ate {formatDate(prescription.validUntil)}
                          </span>
                        </div>
                      </div>
                      {prescription.pdfUrl && (
                        <a
                          href={prescription.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired prescriptions */}
      {expiredPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <XCircle className="h-5 w-5" />
              Prescricoes Expiradas ({expiredPrescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border rounded-lg p-4 bg-gray-50 opacity-75"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="bg-gray-200 text-gray-600 mb-2">Expirada</Badge>
                      <h3 className="font-medium text-gray-700">
                        {prescription.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Expirou em {formatDate(prescription.validUntil)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Dr(a). {prescription.doctor.name}
                      </p>
                    </div>
                    {prescription.pdfUrl && (
                      <a
                        href={prescription.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other prescriptions (draft, revoked) */}
      {otherPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outras Prescricoes ({otherPrescriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className={
                        prescription.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {PRESCRIPTION_STATUS_LABELS[prescription.status]}
                      </Badge>
                      <h3 className="font-medium text-gray-900 mt-2">
                        {prescription.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Dr(a). {prescription.doctor.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ANVISA info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Sobre a autorizacao ANVISA</h3>
          <p className="text-sm text-gray-600 mb-4">
            Para importar produtos a base de cannabis, e necessario obter autorizacao
            da ANVISA. O processo inclui:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Laudo medico justificando o tratamento
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Prescricao com dosagem e produto especifico
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Documentos pessoais (RG, CPF, comprovante de residencia)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              Termo de responsabilidade assinado
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
