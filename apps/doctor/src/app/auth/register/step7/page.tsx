'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterProgressBar from '@/components/RegisterProgressBar';

const steps = ['Pessoal', 'Endereço', 'Profissional', 'Documentos', 'Agenda', 'Honorários', 'Revisão'];

interface SectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  stepNumber: number;
}

function ReviewSection({ title, icon, isOpen, onToggle, children, stepNumber }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
          </div>
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/auth/register${stepNumber === 1 ? '' : '/step' + stepNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary hover:underline"
          >
            Editar
          </Link>
          <span
            className={`material-symbols-outlined text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>
      {isOpen && <div className="px-4 pb-4 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

export default function RegisterStep7Page() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>(['pessoal']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [step1Data, setStep1Data] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [step2Data, setStep2Data] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [step3Data, setStep3Data] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [step5Data, setStep5Data] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [step6Data, setStep6Data] = useState<any>({});

  useEffect(() => {
    // Load all step data from localStorage
    const s1 = localStorage.getItem('registerStep1');
    const s2 = localStorage.getItem('registerStep2');
    const s3 = localStorage.getItem('registerStep3');
    const s5 = localStorage.getItem('registerStep5');
    const s6 = localStorage.getItem('registerStep6');

    if (s1) setStep1Data(JSON.parse(s1));
    if (s2) setStep2Data(JSON.parse(s2));
    if (s3) setStep3Data(JSON.parse(s3));
    if (s5) setStep5Data(JSON.parse(s5));
    if (s6) setStep6Data(JSON.parse(s6));
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedPrivacy) {
      alert('Por favor, aceite os termos e a política de privacidade para continuar.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear localStorage and redirect to pending page
    localStorage.removeItem('registerStep1');
    localStorage.removeItem('registerStep2');
    localStorage.removeItem('registerStep3');
    localStorage.removeItem('registerStep4');
    localStorage.removeItem('registerStep5');
    localStorage.removeItem('registerStep6');

    router.push('/auth/pending');
  };

  const getEnabledDays = () => {
    if (!step5Data.schedule) return 'Não configurado';
    const days = Object.entries(step5Data.schedule)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter(([, data]: [string, any]) => data.enabled)
      .map(([day]) => {
        const dayNames: { [key: string]: string } = {
          monday: 'Seg',
          tuesday: 'Ter',
          wednesday: 'Qua',
          thursday: 'Qui',
          friday: 'Sex',
          saturday: 'Sáb',
          sunday: 'Dom',
        };
        return dayNames[day] || day;
      });
    return days.join(', ');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Revise seu Cadastro</h1>
        <p className="text-slate-500 mt-2">Confirme se todas as informações estão corretas</p>
      </div>

      {/* Progress Bar */}
      <RegisterProgressBar currentStep={7} steps={steps} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Data */}
        <ReviewSection
          title="Dados Pessoais"
          icon="person"
          isOpen={openSections.includes('pessoal')}
          onToggle={() => toggleSection('pessoal')}
          stepNumber={1}
        >
          <div className="pt-3">
            <DataRow label="Nome completo" value={step1Data.fullName || '-'} />
            <DataRow label="CPF" value={step1Data.cpf || '-'} />
            <DataRow label="Data de nascimento" value={step1Data.birthDate || '-'} />
            <DataRow label="Telefone" value={step1Data.phone || '-'} />
            <DataRow label="E-mail" value={step1Data.email || '-'} />
          </div>
        </ReviewSection>

        {/* Address */}
        <ReviewSection
          title="Endereço"
          icon="location_on"
          isOpen={openSections.includes('endereco')}
          onToggle={() => toggleSection('endereco')}
          stepNumber={2}
        >
          <div className="pt-3">
            <DataRow label="CEP" value={step2Data.cep || '-'} />
            <DataRow
              label="Endereço"
              value={`${step2Data.street || '-'}, ${step2Data.number || '-'}`}
            />
            <DataRow label="Complemento" value={step2Data.complement || '-'} />
            <DataRow label="Bairro" value={step2Data.neighborhood || '-'} />
            <DataRow label="Cidade/UF" value={`${step2Data.city || '-'}/${step2Data.state || '-'}`} />
          </div>
        </ReviewSection>

        {/* Professional Data */}
        <ReviewSection
          title="Dados Profissionais"
          icon="medical_information"
          isOpen={openSections.includes('profissional')}
          onToggle={() => toggleSection('profissional')}
          stepNumber={3}
        >
          <div className="pt-3">
            <DataRow label="CRM" value={`${step3Data.crm || '-'} / ${step3Data.crmState || '-'}`} />
            <DataRow label="Especialidade principal" value={step3Data.mainSpecialty || '-'} />
            <DataRow
              label="Outras especialidades"
              value={step3Data.otherSpecialties?.join(', ') || '-'}
            />
            <DataRow label="RQE" value={step3Data.rqe || '-'} />
            <DataRow label="Tempo de experiência" value={step3Data.experience || '-'} />
          </div>
        </ReviewSection>

        {/* Documents */}
        <ReviewSection
          title="Documentos"
          icon="description"
          isOpen={openSections.includes('documentos')}
          onToggle={() => toggleSection('documentos')}
          stepNumber={4}
        >
          <div className="pt-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>Documentos enviados com sucesso</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Seus documentos serão analisados pela nossa equipe após o envio do cadastro.
            </p>
          </div>
        </ReviewSection>

        {/* Schedule */}
        <ReviewSection
          title="Agenda"
          icon="calendar_month"
          isOpen={openSections.includes('agenda')}
          onToggle={() => toggleSection('agenda')}
          stepNumber={5}
        >
          <div className="pt-3">
            <DataRow label="Dias de atendimento" value={getEnabledDays()} />
            <DataRow
              label="Duração da consulta"
              value={`${step5Data.consultationDuration || 30} minutos`}
            />
          </div>
        </ReviewSection>

        {/* Fees */}
        <ReviewSection
          title="Honorários"
          icon="payments"
          isOpen={openSections.includes('honorarios')}
          onToggle={() => toggleSection('honorarios')}
          stepNumber={6}
        >
          <div className="pt-3">
            <DataRow label="Valor da consulta" value={step6Data.consultationValue || '-'} />
            <DataRow label="Valor da teleconsulta" value={step6Data.telemedicineValue || '-'} />
            <DataRow label="Desconto para retorno" value={`${step6Data.followUpDiscount || 0}%`} />
            <DataRow
              label="Aceita convênios"
              value={step6Data.acceptsHealthPlan ? 'Sim' : 'Não'}
            />
          </div>
        </ReviewSection>

        {/* Terms and Privacy */}
        <div className="space-y-3 pt-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-5 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <p className="text-sm text-slate-600">
              Li e concordo com os{' '}
              <a href="#" className="text-primary font-semibold hover:underline">
                Termos de Uso
              </a>{' '}
              da plataforma CANNEO.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-0.5 size-5 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <p className="text-sm text-slate-600">
              Li e concordo com a{' '}
              <a href="#" className="text-primary font-semibold hover:underline">
                Política de Privacidade
              </a>{' '}
              e autorizo o tratamento dos meus dados conforme a LGPD.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
          <span className="material-symbols-outlined text-emerald-500 shrink-0">verified</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Próximos Passos</p>
            <p className="text-sm text-emerald-700">
              Após enviar o cadastro, nossa equipe irá analisar seus dados e documentos. Você
              receberá um e-mail assim que seu cadastro for aprovado.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Link
            href="/auth/register/step6"
            className="flex-1 py-4 border border-slate-300 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !acceptedTerms || !acceptedPrivacy}
            className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar Cadastro
                <span className="material-symbols-outlined">check_circle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
