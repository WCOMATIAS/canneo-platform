'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterProgressBar from '@/components/RegisterProgressBar';

const steps = ['Pessoal', 'Endereço', 'Profissional', 'Documentos', 'Agenda', 'Honorários', 'Revisão'];

const PLATFORM_FEE_PERCENT = 15;

export default function RegisterStep6Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    consultationValue: '',
    followUpDiscount: 20,
    telemedicineValue: '',
    acceptsHealthPlan: false,
  });

  const [earnings, setEarnings] = useState({
    perConsultation: 0,
    weekly: 0,
    monthly: 0,
  });

  // Load weekly slots from step 5
  const [weeklySlots, setWeeklySlots] = useState(40);

  useEffect(() => {
    const step5Data = localStorage.getItem('registerStep5');
    if (step5Data) {
      try {
        const { schedule, consultationDuration } = JSON.parse(step5Data);
        // Calculate total weekly slots
        let totalSlots = 0;
        Object.keys(schedule).forEach((dayId) => {
          const day = schedule[dayId];
          if (day.enabled) {
            const start = parseInt(day.startTime.split(':')[0]) * 60 + parseInt(day.startTime.split(':')[1]);
            const end = parseInt(day.endTime.split(':')[0]) * 60 + parseInt(day.endTime.split(':')[1]);
            const slotTime = consultationDuration + day.interval;
            totalSlots += Math.floor((end - start) / slotTime);
          }
        });
        setWeeklySlots(totalSlots || 40);
      } catch {
        setWeeklySlots(40);
      }
    }
  }, []);

  // Calculate earnings whenever consultation value changes
  useEffect(() => {
    const value = parseFloat(formData.consultationValue.replace(/\D/g, '')) / 100 || 0;
    const platformFee = value * (PLATFORM_FEE_PERCENT / 100);
    const netPerConsultation = value - platformFee;

    setEarnings({
      perConsultation: netPerConsultation,
      weekly: netPerConsultation * weeklySlots,
      monthly: netPerConsultation * weeklySlots * 4,
    });
  }, [formData.consultationValue, weeklySlots]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    if (isNaN(amount)) return '';
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = formatCurrency(value);
    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'range' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('registerStep6', JSON.stringify(formData));
    router.push('/auth/register/step7');
  };

  const displayCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Defina seus Honorários</h1>
        <p className="text-slate-500 mt-2">Configure os valores das suas consultas</p>
      </div>

      {/* Progress Bar */}
      <RegisterProgressBar currentStep={6} steps={steps} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultation Value */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Valor da Consulta Presencial <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="consultationValue"
              value={formData.consultationValue}
              onChange={handleCurrencyChange}
              required
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right text-lg font-semibold"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Valor cobrado do paciente por consulta particular
          </p>
        </div>

        {/* Telemedicine Value */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Valor da Teleconsulta
          </label>
          <div className="relative">
            <input
              type="text"
              name="telemedicineValue"
              value={formData.telemedicineValue}
              onChange={handleCurrencyChange}
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right text-lg font-semibold"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deixe em branco se não deseja oferecer teleconsultas
          </p>
        </div>

        {/* Follow-up Discount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Desconto para Retorno
          </label>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Desconto aplicado em consultas de retorno</span>
              <span className="text-lg font-bold text-primary">{formData.followUpDiscount}%</span>
            </div>
            <input
              type="range"
              name="followUpDiscount"
              min="0"
              max="50"
              step="5"
              value={formData.followUpDiscount}
              onChange={handleChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Health Plan Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            name="acceptsHealthPlan"
            checked={formData.acceptsHealthPlan}
            onChange={handleChange}
            className="mt-0.5 size-5 rounded border-slate-300 text-primary focus:ring-primary/20"
          />
          <div>
            <p className="text-sm font-semibold text-slate-700">Aceito convênios médicos</p>
            <p className="text-xs text-slate-500">
              Marque se você atende pacientes com planos de saúde
            </p>
          </div>
        </div>

        {/* Platform Fee Info */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-500">info</span>
            <span className="font-semibold text-amber-800">Taxa da Plataforma</span>
          </div>
          <p className="text-sm text-amber-700">
            A CANNEO cobra uma taxa de <strong>{PLATFORM_FEE_PERCENT}%</strong> sobre cada consulta
            realizada pela plataforma. Esta taxa inclui processamento de pagamentos, suporte ao
            paciente e manutenção da infraestrutura.
          </p>
        </div>

        {/* Earnings Simulator */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-500">calculate</span>
            <span className="font-semibold text-emerald-800">Simulador de Ganhos</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Sua agenda semanal:</span>
              <span className="font-semibold text-slate-900">{weeklySlots} consultas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Você recebe por consulta:</span>
              <span className="font-semibold text-emerald-600">
                {displayCurrency(earnings.perConsultation)}
              </span>
            </div>
            <div className="h-px bg-emerald-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Ganho semanal estimado:</span>
              <span className="font-bold text-emerald-600">{displayCurrency(earnings.weekly)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Ganho mensal estimado:</span>
              <span className="text-xl font-black text-emerald-600">
                {displayCurrency(earnings.monthly)}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            * Valores estimados considerando ocupação total da agenda
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Link
            href="/auth/register/step5"
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
