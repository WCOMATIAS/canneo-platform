'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const patient = {
  id: '1',
  name: 'Maria Aparecida Silva',
  age: 42,
  cpf: '123.456.789-00',
  bloodType: 'A+',
  insurance: 'Unimed',
  status: 'Ativa',
  phone: '(11) 99999-9999',
  email: 'maria.silva@email.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
};

const allergies = ['Dipirona Sódica', 'Penicilina'];

const activePrescriptions = [
  {
    id: '1',
    name: 'Ibuprofeno 600mg',
    dosage: 'Tomar 1 comp. a cada 8h por 5 dias.',
    date: '15/10/2023',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Omeprazol 20mg',
    dosage: 'Tomar 1 comp. em jejum.',
    date: '15/10/2023',
    status: 'Ativo',
  },
];

const attachedExams = [
  {
    id: '1',
    name: 'Hemograma_Completo.pdf',
    date: '12 Out 2023',
    size: '2.4 MB',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'Ressonancia_Lombar.jpg',
    date: '05 Set 2023',
    size: '4.1 MB',
    type: 'image',
  },
];

const clinicalHistory = [
  {
    id: '1',
    type: 'Consulta de Retorno',
    badge: 'Presencial',
    badgeColor: 'blue',
    date: '15 Out 2023, 14:30',
    description: 'Paciente retorna referindo melhora significativa das dores lombares após início da medicação prescrita (Ibuprofeno). Relata, no entanto, leve desconforto gástrico. Pressão arterial 120/80 mmHg. Mantida a conduta fisioterápica.',
    doctor: 'Dr. André Souza',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    isRecent: true,
  },
  {
    id: '2',
    type: 'Consulta Inicial',
    badge: 'Primeira Vez',
    badgeColor: 'green',
    date: '20 Set 2023, 09:15',
    description: 'Paciente sexo feminino, 42 anos, queixa-se de dores na região lombar irradiando para a perna direita. Dor iniciou há 2 semanas após esforço físico. Sem histórico de traumas recentes. Solicito Ressonância Magnética.',
    doctor: 'Dra. Roberta Lima',
    doctorAvatar: '',
    isRecent: false,
  },
];

export default function PatientDetailPage() {
  const params = useParams();
  const [evolutionNote, setEvolutionNote] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-[1440px] mx-auto p-6 md:p-8 lg:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Info & Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Patient Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative group">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full size-24 md:size-32 shadow-md ring-4 ring-slate-100"
                  style={{ backgroundImage: `url(${patient.avatar})` }}
                />
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm border-2 border-white">
                  {patient.status}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                      {patient.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2 text-slate-500 text-sm md:text-base items-center">
                      <span>{patient.age} anos</span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span>CPF: {patient.cpf}</span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span>Convênio: {patient.insurance}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">bloodtype</span>
                      <span className="font-bold text-lg">{patient.bloodType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">edit</span> Editar Dados
                  </button>
                  <Link
                    href={`/patients/${params.id}/history`}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-lg">history</span> Ver Histórico Completo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {['overview', 'history', 'documents', 'prescriptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'history' && 'Histórico'}
                {tab === 'documents' && 'Documentos'}
                {tab === 'prescriptions' && 'Prescrições'}
              </button>
            ))}
          </div>

          {/* New Evolution Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Nova Evolução
              </h2>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="p-4 md:p-6">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100">
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors" title="Negrito">
                  <span className="material-symbols-outlined text-xl">format_bold</span>
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors" title="Itálico">
                  <span className="material-symbols-outlined text-xl">format_italic</span>
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors" title="Sublinhado">
                  <span className="material-symbols-outlined text-xl">format_underlined</span>
                </button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto"></div>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors" title="Lista">
                  <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors" title="Link">
                  <span className="material-symbols-outlined text-xl">add_link</span>
                </button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto"></div>
                <Link
                  href="/templates"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Modelo"
                >
                  <span className="material-symbols-outlined text-xl">description</span>
                  <span className="hidden sm:inline">Usar Modelo</span>
                </Link>
              </div>
              <textarea
                value={evolutionNote}
                onChange={(e) => setEvolutionNote(e.target.value)}
                className="w-full min-h-[160px] resize-y rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary p-4 text-slate-900 placeholder:text-slate-400 text-base leading-relaxed"
                placeholder="Descreva o estado atual do paciente, queixas, exame físico e conduta..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button className="px-6 py-2 rounded-lg bg-primary text-white font-bold shadow-sm hover:bg-primary-dark hover:shadow transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">save</span>
                  Salvar Evolução
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 px-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">timeline</span>
              Histórico Clínico
            </h3>
            <div className="relative pl-4 md:pl-8 space-y-8">
              <div className="absolute left-[27px] md:left-[43px] top-2 bottom-0 w-[2px] bg-slate-200"></div>
              {clinicalHistory.map((item) => (
                <div key={item.id} className="relative pl-10 md:pl-12">
                  <div
                    className={`absolute left-0 top-1 size-3 rounded-full ring-4 ring-slate-100 z-10 md:left-[29px] ${
                      item.isRecent ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  ></div>
                  <div
                    className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ${
                      !item.isRecent ? 'opacity-90' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-lg">{item.type}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            item.badgeColor === 'blue'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {item.date}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-4 text-sm md:text-base">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                      <div className="flex items-center gap-2">
                        {item.doctorAvatar ? (
                          <div
                            className="size-6 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${item.doctorAvatar})` }}
                          />
                        ) : (
                          <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            DR
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-900">{item.doctor}</span>
                      </div>
                      <button className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1">
                        Ver Detalhes <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">expand_more</span>
              Carregar evoluções anteriores
            </button>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Action Buttons */}
          <Link
            href="/prescriptions/new"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
          >
            <span className="material-symbols-outlined text-primary">playlist_add</span>
            <span className="font-bold text-lg">Gerar Nova Prescrição</span>
          </Link>

          {/* Allergies Card */}
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <div className="flex items-center gap-2 mb-3 text-red-700">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-bold text-sm uppercase tracking-wide">Alergias & Alertas</h3>
            </div>
            <ul className="space-y-2">
              {allergies.map((allergy, index) => (
                <li key={index} className="flex items-start gap-2 text-red-800 font-medium">
                  <span className="material-symbols-outlined text-lg mt-0.5">block</span>
                  {allergy}
                </li>
              ))}
            </ul>
          </div>

          {/* Active Prescriptions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">pill</span>
                Prescrições Ativas
              </h3>
              <button className="text-xs text-primary font-bold hover:underline">Ver todas</button>
            </div>
            <div className="divide-y divide-slate-100">
              {activePrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{prescription.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      {prescription.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{prescription.dosage}</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">event</span> {prescription.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Attached Exams */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">folder_open</span>
                Exames Anexados
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded text-primary">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="p-2 space-y-1">
              {attachedExams.map((exam) => (
                <a
                  key={exam.id}
                  href="#"
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                >
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                      exam.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {exam.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                      {exam.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {exam.date} • {exam.size}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 hover:text-slate-700">download</span>
                </a>
              ))}
            </div>
            <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 border-t border-slate-200 uppercase tracking-wide">
              Ver todos os arquivos
            </button>
          </div>

          {/* Quick Notes */}
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 relative">
            <div className="absolute top-0 right-0 p-2">
              <span className="material-symbols-outlined text-amber-600/50 -rotate-12 text-4xl">push_pin</span>
            </div>
            <h3 className="font-bold text-sm text-amber-800 mb-2 uppercase tracking-wide">Observações Gerais</h3>
            <p className="text-sm text-amber-900/80 font-medium leading-relaxed">
              Paciente prefere agendamentos no período da tarde. Contato de emergência: Marido (Carlos) - (11) 99999-9999.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
