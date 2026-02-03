'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Panel - Hero */}
        <div className="flex-1 relative overflow-hidden hidden md:block bg-gradient-to-br from-emerald-600 to-teal-700">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=1600&fit=crop"
              alt="Consultório Médico"
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
                Transformando vidas através da medicina canabinoide
              </h1>
              <p className="text-emerald-100 text-lg">
                Conecte-se com seus pacientes, gerencie consultas e prescreva tratamentos de forma segura e regulamentada.
              </p>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <p className="text-3xl font-bold text-white">1.2k+</p>
                  <p className="text-emerald-200 text-sm">Médicos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50k+</p>
                  <p className="text-emerald-200 text-sm">Pacientes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-emerald-200 text-sm">Satisfação</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white italic">
                "A CANNEO revolucionou minha prática médica. A plataforma é intuitiva e segura."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face"
                  alt="Dr. Ricardo"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">Dr. Ricardo Mendes</p>
                  <p className="text-emerald-200 text-sm">Neurologista • CRM 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">local_hospital</span>
            </div>
            <span className="text-xl font-bold text-slate-900">CANNEO</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta!</h1>
            <p className="text-slate-600">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600">Lembrar de mim</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              Entrar
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-slate-600">
            Não tem uma conta?{' '}
            <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Cadastre-se aqui
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-8">
            © 2024 CANNEO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
