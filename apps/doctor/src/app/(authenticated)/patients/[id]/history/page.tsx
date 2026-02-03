'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const patient = {
  name: 'Maria Aparecida Silva',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
};

const historyItems = [
  {
    id: '1',
    type: 'consultation',
    icon: 'stethoscope',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Consulta de Retorno',
    date: '15 Out 2023',
    time: '14:30',
    doctor: 'Dr. André Souza',
    description: 'Paciente retorna referindo melhora significativa das dores lombares após início da medicação prescrita. Mantida a conduta fisioterápica.',
    tags: ['Presencial', 'Retorno'],
  },
  {
    id: '2',
    type: 'exam',
    icon: 'lab_profile',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Exame: Hemograma Completo',
    date: '10 Out 2023',
    time: '10:00',
    doctor: 'Laboratório LabLife',
    description: 'Resultados dentro dos parâmetros normais. Hemoglobina: 13.2 g/dL, Leucócitos: 7.500/mm³.',
    tags: ['Exame', 'Normal'],
    attachment: 'Hemograma_Completo.pdf',
  },
  {
    id: '3',
    type: 'prescription',
    icon: 'medication',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Prescrição: Ibuprofeno 600mg',
    date: '20 Set 2023',
    time: '09:30',
    doctor: 'Dra. Roberta Lima',
    description: 'Prescrito Ibuprofeno 600mg para controle de dor. Tomar 1 comprimido a cada 8 horas por 5 dias.',
    tags: ['Prescrição', 'Ativa'],
  },
  {
    id: '4',
    type: 'consultation',
    icon: 'stethoscope',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Consulta Inicial',
    date: '20 Set 2023',
    time: '09:15',
    doctor: 'Dra. Roberta Lima',
    description: 'Paciente sexo feminino, 42 anos, queixa-se de dores na região lombar irradiando para a perna direita. Solicito Ressonância Magnética.',
    tags: ['Teleconsulta', 'Primeira Vez'],
  },
  {
    id: '5',
    type: 'exam',
    icon: 'radiology',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Exame: Ressonância Magnética',
    date: '05 Set 2023',
    time: '14:00',
    doctor: 'Clínica Imagem',
    description: 'Discopatia degenerativa L4-L5 com protrusão discal posterior. Sem compressão radicular significativa.',
    tags: ['Exame', 'Atenção'],
    attachment: 'Ressonancia_Lombar.pdf',
  },
];

const filterOptions = [
  { value: 'all', label: 'Todos', icon: 'list' },
  { value: 'consultation', label: 'Consultas', icon: 'stethoscope' },
  { value: 'exam', label: 'Exames', icon: 'lab_profile' },
  { value: 'prescription', label: 'Prescrições', icon: 'medication' },
];

export default function PatientHistoryPage() {
  const params = useParams();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = historyItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/patients/${params.id}`}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-full bg-cover bg-center ring-2 ring-primary/20"
              style={{ backgroundImage: `url(${patient.avatar})` }}
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Histórico Completo</h1>
              <p className="text-slate-500">{patient.name}</p>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">download</span>
          Exportar PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no histórico..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        <div className="space-y-6">
          {filteredHistory.map((item, index) => (
            <div key={item.id} className="relative pl-16">
              {/* Timeline Icon */}
              <div
                className={`absolute left-0 top-4 size-12 rounded-full flex items-center justify-center z-10 ${item.iconBg}`}
              >
                <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
              </div>

              {/* Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.doctor}</p>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    {item.date} às {item.time}
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed mb-4">{item.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tag === 'Atenção'
                            ? 'bg-amber-100 text-amber-700'
                            : tag === 'Ativa'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {item.attachment && (
                      <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <span className="material-symbols-outlined text-base">attach_file</span>
                        {item.attachment}
                      </button>
                    )}
                    <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                      Ver detalhes
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <button className="w-full mt-8 py-4 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">expand_more</span>
          Carregar mais registros
        </button>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
          <p className="text-slate-500">Nenhum registro encontrado</p>
        </div>
      )}
    </div>
  );
}
