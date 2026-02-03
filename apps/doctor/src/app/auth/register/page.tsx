'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('registerStep1', JSON.stringify(formData));
    router.push('/auth/register/step2');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Panel - Hero */}
        <div className="flex-1 relative overflow-hidden hidden md:block bg-gradient-to-br from-emerald-600 to-teal-700">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=1600&fit=crop"
              alt="Médico"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">local_hospital</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">CANNEO</span>
                <p className="text-emerald-200 text-sm">Portal do Médico</p>
              </div>
            </div>

            {/* Main Text */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Junte-se à maior plataforma de medicina canabinoide do Brasil
              </h1>
              <p className="text-emerald-100 text-lg">
                Cadastre-se gratuitamente e comece a atender pacientes em busca de tratamentos alternativos.
              </p>

              {/* Benefits */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">verified</span>
                  </div>
                  <span className="text-white">Plataforma 100% regulamentada pela ANVISA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">security</span>
                  </div>
                  <span className="text-white">Dados protegidos com criptografia LGPD</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">payments</span>
                  </div>
                  <span className="text-white">Receba seus honorários de forma segura</span>
                </div>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-emerald-200 text-sm mb-3">Processo de cadastro</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-white"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
                <div className="h-2 flex-1 rounded-full bg-white/30"></div>
              </div>
              <p className="text-white text-sm mt-3">Etapa 1 de 7 • Dados Pessoais</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">local_hospital</span>
            </div>
            <span className="text-xl font-bold text-slate-900">CANNEO</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Criar sua conta</h1>
            <p className="text-slate-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Faça login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="João"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sobrenome
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Silva"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* CPF & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                required
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirmar senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 mt-1 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-600">
                Concordo com os{' '}
                <button type="button" className="text-emerald-600 font-medium hover:underline">
                  Termos de Uso
                </button>
                {' '}e{' '}
                <button type="button" className="text-emerald-600 font-medium hover:underline">
                  Política de Privacidade
                </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 mt-2"
            >
              Continuar
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-6">
            © 2024 CANNEO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
