'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Cpu,
  Key,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuperAdminSystemMetrics } from '@/hooks/use-super-admin';
import { useQueryClient } from '@tanstack/react-query';

function getStatusIcon(status: 'healthy' | 'degraded' | 'down') {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-400" />;
  }
}

function getStatusBadge(status: 'healthy' | 'degraded' | 'down') {
  const statusMap = {
    healthy: { label: 'Saudavel', className: 'bg-green-900/50 text-green-400 border-green-700' },
    degraded: { label: 'Degradado', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    down: { label: 'Fora do Ar', className: 'bg-red-900/50 text-red-400 border-red-700' },
  };
  const statusInfo = statusMap[status];
  return (
    <Badge variant="outline" className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, dataUpdatedAt } = useSuperAdminSystemMetrics();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin', 'monitoring'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitoramento</h1>
          <p className="text-gray-400">Acompanhe o status dos servicos da plataforma em tempo real</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Atualizado: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR') : '-'}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">Erro ao carregar metricas do sistema</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={handleRefresh}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Service Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Server className="h-6 w-6 text-blue-400" />
                  </div>
                  {data?.api && getStatusIcon(data.api.status)}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">API</h3>
                {data?.api && (
                  <div className="space-y-2">
                    {getStatusBadge(data.api.status)}
                    <div className="flex items-center justify-between text-sm mt-3">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Resposta
                      </span>
                      <span className="text-white">{data.api.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Uptime
                      </span>
                      <span className="text-white">{formatUptime(data.api.uptime)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-green-400" />
                  </div>
                  {data?.database && getStatusIcon(data.database.status)}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">PostgreSQL</h3>
                {data?.database && (
                  <div className="space-y-2">
                    {getStatusBadge(data.database.status)}
                    <div className="flex items-center justify-between text-sm mt-3">
                      <span className="text-gray-400">Conexoes</span>
                      <span className="text-white">{data.database.connections}/{data.database.poolSize}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(data.database.connections / data.database.poolSize) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redis Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-red-400" />
                  </div>
                  {data?.redis && getStatusIcon(data.redis.status)}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Redis</h3>
                {data?.redis && (
                  <div className="space-y-2">
                    {getStatusBadge(data.redis.status)}
                    <div className="flex items-center justify-between text-sm mt-3">
                      <span className="text-gray-400">Memoria</span>
                      <span className="text-white">{formatBytes(data.redis.memory)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        Keys
                      </span>
                      <span className="text-white">{data.redis.keys.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-purple-400" />
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Armazenamento</h3>
                {data?.storage && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-700">
                      Saudavel
                    </Badge>
                    <div className="flex items-center justify-between text-sm mt-3">
                      <span className="text-gray-400">Usado</span>
                      <span className="text-white">{formatBytes(data.storage.used)} / {formatBytes(data.storage.total)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(data.storage.used / data.storage.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {((data.storage.used / data.storage.total) * 100).toFixed(1)}% utilizado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Erros Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentErrors && data.recentErrors.length > 0 ? (
                <div className="space-y-3">
                  {data.recentErrors.map((error) => (
                    <div
                      key={error.id}
                      className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-red-300 font-medium truncate">{error.message}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {formatDateTime(error.createdAt)}
                          </p>
                        </div>
                      </div>
                      {error.stack && (
                        <pre className="mt-3 text-xs text-gray-400 bg-gray-800 p-3 rounded overflow-x-auto max-h-32">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum erro recente registrado</p>
                  <p className="text-sm text-gray-500 mt-1">O sistema esta funcionando normalmente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Informacoes do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400">Versao da API</p>
                  <p className="text-lg font-semibold text-white">1.0.0</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400">Ambiente</p>
                  <p className="text-lg font-semibold text-white">Producao</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400">Node.js</p>
                  <p className="text-lg font-semibold text-white">v20.x</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400">Regiao</p>
                  <p className="text-lg font-semibold text-white">Brasil</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
