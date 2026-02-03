'use client';

import { useState } from 'react';
import Link from 'next/link';

const exams = [
  {
    id: 1,
    name: 'Hemograma Completo.pdf',
    type: 'Exame de sangue',
    category: 'blood',
    date: '24 Jan, 2026',
    size: '1.2 MB',
    status: 'viewed',
    laboratory: 'Laboratório Fleury',
  },
  {
    id: 2,
    name: 'Laudo Neurológico - Dr. André.pdf',
    type: 'Laudo',
    category: 'report',
    date: '20 Jan, 2026',
    size: '2.4 MB',
    status: 'viewed',
    laboratory: 'Hospital Albert Einstein',
  },
  {
    id: 3,
    name: 'Atestado Médico - Janeiro.pdf',
    type: 'Atestado',
    category: 'certificate',
    date: '15 Jan, 2026',
    size: '450 KB',
    status: 'sent',
    laboratory: 'Clínica CANNEO',
  },
  {
    id: 4,
    name: 'Ressonância Magnética.pdf',
    type: 'Exame de imagem',
    category: 'imaging',
    date: '10 Jan, 2026',
    size: '15.3 MB',
    status: 'viewed',
    laboratory: 'DASA Diagnósticos',
  },
  {
    id: 5,
    name: 'Exame Toxicológico.pdf',
    type: 'Exame',
    category: 'blood',
    date: '05 Jan, 2026',
    size: '890 KB',
    status: 'sent',
    laboratory: 'Laboratório Hermes Pardini',
  },
];

export default function ExamsPage() {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'blood':
        return { icon: 'biotech', color: 'bg-purple-100 text-purple-600' };
      case 'imaging':
        return { icon: 'radiology', color: 'bg-blue-100 text-blue-600' };
      case 'report':
        return { icon: 'description', color: 'bg-green-100 text-green-600' };
      case 'certificate':
        return { icon: 'verified', color: 'bg-orange-100 text-orange-600' };
      default:
        return { icon: 'folder', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const filteredExams = exams
    .filter((exam) => {
      const matchesType = filterType === 'all' || exam.category === filterType;
      const matchesSearch =
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.laboratory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Exames</h1>
          <p className="text-slate-500 mt-1">Gerencie seus exames, laudos e atestados médicos.</p>
        </div>
        <Link
          href="/exams/upload"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">upload</span>
          Enviar Novo Exame
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">folder</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{exams.length}</p>
              <p className="text-xs text-slate-500">Total de documentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <span className="material-symbols-outlined">biotech</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {exams.filter((e) => e.category === 'blood').length}
              </p>
              <p className="text-xs text-slate-500">Exames de sangue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {exams.filter((e) => e.status === 'viewed').length}
              </p>
              <p className="text-xs text-slate-500">Visualizados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {exams.filter((e) => e.status === 'sent').length}
              </p>
              <p className="text-xs text-slate-500">Aguardando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, tipo ou laboratório..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="all">Todos os tipos</option>
          <option value="blood">Exame de sangue</option>
          <option value="imaging">Exame de imagem</option>
          <option value="report">Laudo</option>
          <option value="certificate">Atestado</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="newest">Mais recente</option>
          <option value="oldest">Mais antigo</option>
        </select>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredExams.map((exam) => {
            const typeInfo = getTypeIcon(exam.category);
            return (
              <div
                key={exam.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center justify-center size-12 rounded-lg ${typeInfo.color}`}>
                    <span className="material-symbols-outlined">{typeInfo.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{exam.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{exam.type}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{exam.laboratory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-slate-900">{exam.date}</p>
                    <p className="text-xs text-slate-500">{exam.size}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {exam.status === 'viewed' ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Visualizado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Enviado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Visualizar">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Baixar">
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Excluir">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredExams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">folder_open</span>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum documento encontrado</h3>
            <p className="text-slate-500 text-sm mb-6">Tente ajustar os filtros ou envie um novo documento</p>
            <Link
              href="/exams/upload"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">upload</span>
              Enviar Exame
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
