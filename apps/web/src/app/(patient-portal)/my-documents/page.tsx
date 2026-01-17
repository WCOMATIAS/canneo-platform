'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Upload, FileText, Image, File } from 'lucide-react';

export default function MyDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-500">Envie e gerencie seus documentos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Enviar Documento
        </Button>
      </div>

      {/* Documentos obrigatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Obrigatorios para ANVISA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">RG ou CNH</p>
                  <p className="text-sm text-gray-500">Nao enviado</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">CPF</p>
                  <p className="text-sm text-gray-500">Nao enviado</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <File className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Comprovante de Residencia</p>
                  <p className="text-sm text-gray-500">Nao enviado</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Exames/Laudos Anteriores</p>
                  <p className="text-sm text-gray-500">Opcional</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos enviados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documentos Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento enviado
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Envie seus documentos para agilizar o processo de autorizacao ANVISA.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
