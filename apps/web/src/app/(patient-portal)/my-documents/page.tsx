'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import {
  usePatientDocuments,
  useUploadDocument,
  useDeleteDocument,
} from '@/hooks/use-patient-portal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

export default function MyDocumentsPage() {
  const { data, isLoading } = usePatientDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (type: string) => {
    setSelectedType(type);
    setUploadDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, type: selectedType },
      {
        onSuccess: () => {
          setUploadDialogOpen(false);
          setSelectedType('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const documents = data?.documents || [];
  const requiredDocuments = data?.requiredDocuments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-500">Envie e gerencie seus documentos</p>
        </div>
        {data?.requiredMissing === 0 && (
          <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Todos os documentos enviados
          </Badge>
        )}
      </div>

      {/* Pending alert */}
      {data?.requiredMissing && data.requiredMissing > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">
                {data.requiredMissing} documento(s) obrigatorio(s) pendente(s)
              </p>
              <p className="text-sm text-amber-700">
                Envie os documentos abaixo para agilizar o processo de autorizacao ANVISA.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Obrigatorios para ANVISA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requiredDocuments.map((req) => (
              <div
                key={req.type}
                className={`p-4 border rounded-lg ${
                  req.uploaded
                    ? 'border-green-200 bg-green-50'
                    : req.required
                    ? 'border-dashed border-amber-300 bg-amber-50'
                    : 'border-dashed border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    req.uploaded
                      ? 'bg-green-100'
                      : req.required
                      ? 'bg-amber-100'
                      : 'bg-gray-100'
                  }`}>
                    {req.uploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : req.type === 'RG' ? (
                      <Image className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{req.label}</p>
                    <p className="text-sm text-gray-500">
                      {req.uploaded
                        ? `${req.documents.length} arquivo(s) enviado(s)`
                        : req.required
                        ? 'Obrigatorio'
                        : 'Opcional'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadClick(req.type)}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                {/* Show uploaded files for this type */}
                {req.uploaded && req.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {req.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 text-sm bg-white p-2 rounded border"
                      >
                        {getFileIcon(doc.mimeType)}
                        <span className="flex-1 truncate">{doc.name}</span>
                        <span className="text-gray-400 text-xs">
                          {formatFileSize(doc.size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClick(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Todos os Documentos ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento enviado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Envie seus documentos para agilizar o processo de autorizacao ANVISA.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {doc.type} • {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para enviar. Formatos aceitos: JPG, PNG, PDF (max 10MB)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="w-full h-24 border-2 border-dashed"
              variant="outline"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mr-2" />
                  Clique para selecionar arquivo
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusao</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este documento? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
