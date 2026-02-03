'use client';

import { useState } from 'react';

const templateData = [
  {
    id: '1',
    name: 'Primeira Consulta - Insônia',
    description: 'Modelo estruturado para primeira anamnese',
    specialty: 'Psiquiatria',
    specialtyColor: 'bg-blue-100 text-blue-800',
    createdAt: '12/10/2023',
    status: 'active',
    content: `<p><strong>HISTÓRIA DA DOENÇA ATUAL</strong></p>
<p>Paciente <span class="variable-tag">{{nome_paciente}}</span> comparece para avaliação de queixas relacionadas ao sono. Relata início dos sintomas há aproximadamente 6 meses.</p>
<br/>
<p><strong>PLANO TERAPÊUTICO</strong></p>
<p>Prescrito: <span class="variable-tag">{{thc_prescrito}}</span> para uso noturno, gotas sublinguais.</p>
<p>Data do Atendimento: <span class="variable-tag">{{data_hoje}}</span></p>`,
  },
  {
    id: '2',
    name: 'Retorno - Ansiedade',
    description: 'Modelo para consultas de retorno',
    specialty: 'Clínica Geral',
    specialtyColor: 'bg-slate-100 text-slate-800',
    createdAt: '05/11/2023',
    status: 'active',
    content: `<p><strong>EVOLUÇÃO</strong></p>
<p>Paciente <span class="variable-tag">{{nome_paciente}}</span> retorna para acompanhamento.</p>`,
  },
  {
    id: '3',
    name: 'Evolução Padrão - THC',
    description: 'Template para evolução com THC',
    specialty: 'Neurologia',
    specialtyColor: 'bg-purple-100 text-purple-800',
    createdAt: '20/01/2024',
    status: 'inactive',
    content: `<p><strong>PRESCRIÇÃO CANÁBICA</strong></p>
<p>Paciente: <span class="variable-tag">{{nome_paciente}}</span></p>
<p>THC: <span class="variable-tag">{{thc_prescrito}}</span></p>
<p>CBD: <span class="variable-tag">{{dosagem_cbd}}</span></p>`,
  },
  {
    id: '4',
    name: 'Avaliação Inicial - Dor Crônica',
    description: 'Anamnese completa para dor crônica',
    specialty: 'Medicina da Dor',
    specialtyColor: 'bg-amber-100 text-amber-800',
    createdAt: '15/02/2024',
    status: 'active',
    content: `<p><strong>QUEIXA PRINCIPAL</strong></p>
<p>Paciente <span class="variable-tag">{{nome_paciente}}</span> apresenta-se com queixa de dor.</p>`,
  },
];

const variables = [
  { name: '{{nome_paciente}}', color: 'primary' },
  { name: '{{cpf_paciente}}', color: 'primary' },
  { name: '{{data_hoje}}', color: 'primary' },
  { name: '{{thc_prescrito}}', color: 'green' },
  { name: '{{dosagem_cbd}}', color: 'green' },
];

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templateData[0]);
  const [editedTitle, setEditedTitle] = useState(templateData[0].name);
  const [showEditor, setShowEditor] = useState(true);

  const filteredTemplates = templateData.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: typeof templateData[0]) => {
    setSelectedTemplate(template);
    setEditedTitle(template.name);
    setShowEditor(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">
              Meus Modelos de Evolução
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerencie seus templates e agilize o atendimento clínico.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Novo Template</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background-light p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center">
              <div className="pl-4 text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none focus:ring-0 bg-transparent text-slate-700 placeholder:text-slate-400 px-4 py-3 text-base"
                placeholder="Pesquisar modelos por nome ou especialidade..."
              />
              <button className="mr-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filtrar
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex gap-6 items-start">
            {/* Table Section */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nome do Modelo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Especialidade
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Data de Criação
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedTemplate.id === template.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{template.name}</span>
                          <span className="text-xs text-slate-400">{template.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.specialtyColor}`}
                        >
                          {template.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">{template.createdAt}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            template.status === 'active'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              template.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          {template.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                          <button className="hover:text-primary">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button className="hover:text-primary">
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                          </button>
                          <button className="hover:text-red-500">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                    search_off
                  </span>
                  <p className="text-slate-500">Nenhum template encontrado</p>
                </div>
              )}
            </div>

            {/* Editor Section */}
            {showEditor && (
              <div className="w-[450px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden self-stretch">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Editor de Template
                  </h3>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Título do Modelo
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Variables */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Variáveis Dinâmicas (Clique para inserir)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <button
                          key={variable.name}
                          className={`text-[11px] font-bold px-2 py-1 border rounded hover:opacity-80 transition-colors ${
                            variable.color === 'primary'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {variable.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 flex flex-col border border-slate-200 rounded-lg overflow-hidden min-h-[300px]">
                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
                      <button className="p-1 hover:bg-white rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">format_bold</span>
                      </button>
                      <button className="p-1 hover:bg-white rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">format_italic</span>
                      </button>
                      <button className="p-1 hover:bg-white rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          format_list_bulleted
                        </span>
                      </button>
                      <div className="w-[1px] h-4 bg-slate-300 mx-1 self-center"></div>
                      <button className="p-1 hover:bg-white rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">link</span>
                      </button>
                    </div>
                    <div
                      className="flex-1 p-4 text-sm leading-relaxed text-slate-700 focus:outline-none bg-white overflow-y-auto prose prose-sm max-w-none"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 italic">
                    Alterações salvas automaticamente às 14:32
                  </span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                      Cancelar
                    </button>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                      Salvar Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .variable-tag {
          background-color: rgba(43, 140, 238, 0.15);
          color: #1e70a2;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
