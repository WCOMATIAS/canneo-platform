'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterProgressBar from '@/components/RegisterProgressBar';

const steps = ['Pessoal', 'Endereço', 'Profissional', 'Documentos', 'Agenda', 'Honorários', 'Revisão'];

const brazilianStates = [
  { value: '', label: 'Selecione...' },
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
];

const specialties = [
  { value: '', label: 'Selecione a especialidade principal...' },
  { value: 'clinica_geral', label: 'Clínica Geral' },
  { value: 'psiquiatria', label: 'Psiquiatria' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'medicina_dor', label: 'Medicina da Dor' },
  { value: 'oncologia', label: 'Oncologia' },
  { value: 'geriatria', label: 'Geriatria' },
  { value: 'reumatologia', label: 'Reumatologia' },
  { value: 'gastroenterologia', label: 'Gastroenterologia' },
  { value: 'dermatologia', label: 'Dermatologia' },
  { value: 'endocrinologia', label: 'Endocrinologia' },
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'nutrologia', label: 'Nutrologia' },
  { value: 'medicina_integrativa', label: 'Medicina Integrativa' },
];

const otherSpecialtiesOptions = [
  'Acupuntura',
  'Medicina Canabinoide',
  'Cuidados Paliativos',
  'Dor Crônica',
  'Medicina do Sono',
  'Medicina Funcional',
  'Fitoterapia',
];

const experienceOptions = [
  { value: '', label: 'Selecione...' },
  { value: '0-2', label: 'Até 2 anos' },
  { value: '3-5', label: '3 a 5 anos' },
  { value: '6-10', label: '6 a 10 anos' },
  { value: '11-20', label: '11 a 20 anos' },
  { value: '20+', label: 'Mais de 20 anos' },
];

export default function RegisterStep3Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    crm: '',
    crmState: '',
    mainSpecialty: '',
    otherSpecialties: [] as string[],
    rqe: '',
    experience: '',
    bio: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleOtherSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      otherSpecialties: prev.otherSpecialties.includes(specialty)
        ? prev.otherSpecialties.filter((s) => s !== specialty)
        : [...prev.otherSpecialties, specialty],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('registerStep3', JSON.stringify(formData));
    router.push('/auth/register/step4');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dados Profissionais</h1>
        <p className="text-slate-500 mt-2">Informe seus dados de registro médico</p>
      </div>

      {/* Progress Bar */}
      <RegisterProgressBar currentStep={3} steps={steps} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        {/* CRM and State */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Número do CRM <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="crm"
              value={formData.crm}
              onChange={handleChange}
              required
              placeholder="123456"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              UF do CRM <span className="text-red-500">*</span>
            </label>
            <select
              name="crmState"
              value={formData.crmState}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {brazilianStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Specialty */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Especialidade Principal <span className="text-red-500">*</span>
          </label>
          <select
            name="mainSpecialty"
            value={formData.mainSpecialty}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {specialties.map((specialty) => (
              <option key={specialty.value} value={specialty.value}>
                {specialty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Other Specialties */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Outras Especialidades / Áreas de Atuação
          </label>
          <div className="flex flex-wrap gap-2">
            {otherSpecialtiesOptions.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleOtherSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  formData.otherSpecialties.includes(specialty)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* RQE and Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              RQE (se aplicável)
            </label>
            <input
              type="text"
              name="rqe"
              value={formData.rqe}
              onChange={handleChange}
              placeholder="Número do RQE"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Registro de Qualificação de Especialista
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tempo de Experiência <span className="text-red-500">*</span>
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Mini Biografia / Apresentação
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Conte um pouco sobre sua trajetória profissional e como aborda o tratamento com medicina canabinoide..."
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {formData.bio.length}/500 caracteres
          </p>
        </div>

        {/* CRM Verification Info */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
          <span className="material-symbols-outlined text-emerald-500 shrink-0">verified</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Verificação Automática</p>
            <p className="text-sm text-emerald-700">
              Seu CRM será verificado automaticamente junto ao CFM. Este processo leva até 24 horas.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Link
            href="/auth/register/step2"
            className="flex-1 py-4 border border-slate-300 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </Link>
          <button
            type="submit"
            className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            Próximo
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
