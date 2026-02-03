'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterProgressBar from '@/components/RegisterProgressBar';

const steps = ['Pessoal', 'Endereço', 'Profissional', 'Documentos', 'Agenda', 'Honorários', 'Revisão'];

interface DocumentUpload {
  id: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  file: File | null;
  preview: string | null;
  status: 'pending' | 'uploaded' | 'error';
}

const initialDocuments: DocumentUpload[] = [
  {
    id: 'profile_photo',
    label: 'Foto de Perfil',
    description: 'Foto profissional para seu perfil público',
    icon: 'account_circle',
    required: true,
    file: null,
    preview: null,
    status: 'pending',
  },
  {
    id: 'identity_front',
    label: 'Documento de Identidade (Frente)',
    description: 'RG, CNH ou outro documento oficial com foto',
    icon: 'badge',
    required: true,
    file: null,
    preview: null,
    status: 'pending',
  },
  {
    id: 'identity_back',
    label: 'Documento de Identidade (Verso)',
    description: 'Verso do documento de identificação',
    icon: 'badge',
    required: true,
    file: null,
    preview: null,
    status: 'pending',
  },
  {
    id: 'crm_certificate',
    label: 'Comprovante do CRM',
    description: 'Certificado ou carteira do CRM (digital ou física)',
    icon: 'workspace_premium',
    required: true,
    file: null,
    preview: null,
    status: 'pending',
  },
  {
    id: 'graduation_diploma',
    label: 'Diploma de Graduação',
    description: 'Diploma de medicina ou declaração de conclusão',
    icon: 'school',
    required: true,
    file: null,
    preview: null,
    status: 'pending',
  },
  {
    id: 'specialty_certificate',
    label: 'Certificado de Especialização',
    description: 'Título de especialista (se aplicável)',
    icon: 'military_tech',
    required: false,
    file: null,
    preview: null,
    status: 'pending',
  },
];

export default function RegisterStep4Page() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentUpload[]>(initialDocuments);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileChange = (documentId: string, file: File | null) => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo permitido: 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
      return;
    }

    // Create preview for images
    let preview: string | null = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, file, preview, status: 'uploaded' as const }
          : doc
      )
    );
  };

  const removeFile = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, file: null, preview: null, status: 'pending' as const }
          : doc
      )
    );
  };

  const handleDrop = (e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(documentId, file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required documents
    const missingRequired = documents.filter(
      (doc) => doc.required && doc.status !== 'uploaded'
    );

    if (missingRequired.length > 0) {
      alert(
        `Por favor, envie os seguintes documentos obrigatórios: ${missingRequired
          .map((d) => d.label)
          .join(', ')}`
      );
      return;
    }

    // In a real app, you would upload files to a server here
    localStorage.setItem('registerStep4', JSON.stringify({ completed: true }));
    router.push('/auth/login');
  };

  const uploadedCount = documents.filter((d) => d.status === 'uploaded').length;
  const requiredCount = documents.filter((d) => d.required).length;
  const uploadedRequiredCount = documents.filter(
    (d) => d.required && d.status === 'uploaded'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Upload de Documentos
        </h1>
        <p className="text-slate-500 mt-2">
          Envie os documentos necessários para validação do seu cadastro
        </p>
      </div>

      {/* Progress Bar */}
      <RegisterProgressBar currentStep={4} steps={steps} />

      {/* Upload Progress */}
      <div className="p-4 bg-slate-100 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progresso do envio</span>
          <span className="text-sm font-bold text-primary">
            {uploadedRequiredCount}/{requiredCount} obrigatórios
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(uploadedRequiredCount / requiredCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-4 bg-white rounded-xl border-2 transition-all ${
              doc.status === 'uploaded'
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-200 hover:border-primary/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                  doc.status === 'uploaded' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    doc.status === 'uploaded' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {doc.status === 'uploaded' ? 'check_circle' : doc.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{doc.label}</h3>
                  {doc.required && (
                    <span className="text-xs font-bold text-red-500">*</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{doc.description}</p>

                {/* Upload Area or Preview */}
                {doc.status === 'uploaded' && doc.file ? (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    {doc.preview ? (
                      <div
                        className="size-12 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${doc.preview})` }}
                      />
                    ) : (
                      <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">
                          description
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {doc.file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(doc.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="mt-3 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    onDrop={(e) => handleDrop(e, doc.id)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[doc.id] = el;
                      }}
                      onChange={(e) =>
                        handleFileChange(doc.id, e.target.files?.[0] || null)
                      }
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">
                        cloud_upload
                      </span>
                      <p className="text-sm text-slate-600">
                        <span className="text-primary font-semibold">
                          Clique para enviar
                        </span>{' '}
                        ou arraste o arquivo
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPG, PNG ou PDF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
          <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Importante</p>
            <p className="text-sm text-amber-700">
              Certifique-se de que os documentos estejam legíveis e sem cortes. Documentos
              ilegíveis serão recusados na análise.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Link
            href="/auth/register/step3"
            className="flex-1 py-4 border border-slate-300 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </Link>
          <button
            type="submit"
            className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            Finalizar Cadastro
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </div>

        {/* Save Progress */}
        <p className="text-center text-xs text-slate-400">
          Você pode salvar e continuar depois. Seus dados serão preservados.
        </p>
      </form>
    </div>
  );
}
