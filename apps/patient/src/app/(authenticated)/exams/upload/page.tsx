'use client';

import { useState } from 'react';
import Link from 'next/link';

const existingExams = [
  { id: 1, name: 'Hemograma Completo.pdf', type: 'Exame de sangue', date: '24 Jan, 2026', size: '1.2 MB', status: 'viewed' },
  { id: 2, name: 'Laudo Neurológico.pdf', type: 'Laudo', date: '20 Jan, 2026', size: '2.4 MB', status: 'sent' },
  { id: 3, name: 'Atestado Médico.pdf', type: 'Atestado', date: '15 Jan, 2026', size: '450 KB', status: 'viewed' },
];

export default function ExamUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    examDate: '',
    laboratory: '',
    notes: '',
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/exams"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar para Exames
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Enviar Exames e Documentos</h1>
        <p className="text-slate-500 mt-1">Faça upload de exames, laudos e atestados para seu prontuário.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 hover:border-primary/50 bg-white'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-slate-100'}`}>
                <span className={`material-symbols-outlined text-4xl ${isDragging ? 'text-primary' : 'text-slate-400'}`}>
                  cloud_upload
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  Arraste e solte seus arquivos aqui
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  ou <span className="text-primary font-medium">clique para selecionar</span>
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">PDF</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">JPG</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">PNG</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Máx 10MB</span>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3">Arquivos selecionados</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Informações do documento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de documento *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="blood">Exame de sangue</option>
                  <option value="imaging">Exame de imagem</option>
                  <option value="report">Laudo médico</option>
                  <option value="certificate">Atestado</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data do exame *</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Laboratório / Clínica</label>
                <input
                  type="text"
                  placeholder="Ex: Laboratório Fleury"
                  value={formData.laboratory}
                  onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre o documento"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary resize-none"
                />
              </div>

              <button
                disabled={files.length === 0 || !formData.type || !formData.examDate}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">upload</span>
                Enviar Documento
              </button>
            </div>
          </div>
        </div>

        {/* Existing Exams */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Documentos Enviados</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {existingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{exam.name}</p>
                      <p className="text-xs text-slate-500">{exam.type} • {exam.date} • {exam.size}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {exam.status === 'viewed' ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Visualizado pelo médico
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            Enviado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">lightbulb</span>
              Dicas para envio
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Certifique-se de que o documento está legível</li>
              <li>• Envie arquivos em boa resolução</li>
              <li>• Documentos podem ser vinculados às suas consultas</li>
              <li>• Seu médico será notificado sobre novos uploads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
