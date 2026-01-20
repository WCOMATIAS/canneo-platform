'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Building2,
  Clock,
  Globe,
  Eye,
} from 'lucide-react';
import { useSuperAdminAuditLogs } from '@/hooks/use-super-admin';

const ACTION_TYPES = [
  { value: 'all', label: 'Todas as Acoes' },
  { value: 'CREATE', label: 'Criacao' },
  { value: 'UPDATE', label: 'Atualizacao' },
  { value: 'DELETE', label: 'Exclusao' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'VIEW', label: 'Visualizacao' },
];

const ENTITY_TYPES = [
  { value: 'all', label: 'Todas as Entidades' },
  { value: 'USER', label: 'Usuario' },
  { value: 'PATIENT', label: 'Paciente' },
  { value: 'DOCTOR', label: 'Medico' },
  { value: 'ORGANIZATION', label: 'Organizacao' },
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'PRESCRIPTION', label: 'Prescricao' },
  { value: 'SUBSCRIPTION', label: 'Assinatura' },
];

function getActionBadge(action: string) {
  const actionMap: Record<string, { label: string; className: string }> = {
    CREATE: { label: 'Criacao', className: 'bg-green-900/50 text-green-400 border-green-700' },
    UPDATE: { label: 'Atualizacao', className: 'bg-blue-900/50 text-blue-400 border-blue-700' },
    DELETE: { label: 'Exclusao', className: 'bg-red-900/50 text-red-400 border-red-700' },
    LOGIN: { label: 'Login', className: 'bg-purple-900/50 text-purple-400 border-purple-700' },
    LOGOUT: { label: 'Logout', className: 'bg-gray-600 text-gray-300 border-gray-500' },
    VIEW: { label: 'Visualizacao', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
  };
  const actionInfo = actionMap[action] || { label: action, className: 'bg-gray-600 text-gray-300' };
  return (
    <Badge variant="outline" className={actionInfo.className}>
      {actionInfo.label}
    </Badge>
  );
}

function getEntityLabel(type: string) {
  const entityMap: Record<string, string> = {
    USER: 'Usuario',
    PATIENT: 'Paciente',
    DOCTOR: 'Medico',
    ORGANIZATION: 'Organizacao',
    CONSULTATION: 'Consulta',
    PRESCRIPTION: 'Prescricao',
    SUBSCRIPTION: 'Assinatura',
  };
  return entityMap[type] || type;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data, isLoading, error } = useSuperAdminAuditLogs({
    page,
    limit: 20,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    entityType: entityFilter !== 'all' ? entityFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs de Auditoria</h1>
          <p className="text-gray-400">Acompanhe todas as acoes realizadas na plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Tipo de Acao" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((entity) => (
                  <SelectItem key={entity.value} value={entity.value}>
                    {entity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Data Inicio"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="date"
              placeholder="Data Fim"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Registros de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">Erro ao carregar logs de auditoria</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getActionBadge(log.action)}
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {getEntityLabel(log.entityType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                          {log.user && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user.name}
                            </span>
                          )}
                          {log.organization && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {log.organization.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(log.createdAt)}
                          </span>
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-gray-600"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {expandedLog === log.id ? 'Ocultar' : 'Detalhes'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedLog === log.id && log.details && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-sm text-gray-400 mb-2">Detalhes da Acao:</p>
                      <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                      {log.userAgent && (
                        <p className="text-xs text-gray-500 mt-2">
                          User Agent: {log.userAgent}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Mostrando {((page - 1) * 20) + 1} a {Math.min(page * 20, pagination.total)} de {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-400">
                      Pagina {page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
