'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl min-h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Panel - Hero */}
        <div className="flex-1 relative overflow-hidden hidden md:block bg-gradient-to-br from-emerald-600 to-teal-700">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=1600&fit=crop"
              alt="Saúde e Bem-estar"
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
                <p className="text-emerald-200 text-sm">Portal do Paciente</p>
              </div>
            </div>

            {/* Main Text */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Recupere seu acesso
              </h1>
              <p className="text-emerald-100 text-lg">
                Não se preocupe! Acontece com todo mundo. Enviaremos um link para você criar uma nova senha.
              </p>

              {/* Help */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <span className="material-symbols-outlined text-white text-2xl">support_agent</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Precisa de ajuda?</p>
                    <p className="text-emerald-200 text-sm">Entre em contato: suporte@canneo.com.br</p>
                  </div>
                </div>
              </div>
            </div>

            <div></div>
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

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Esqueceu a senha?</h1>
                <p className="text-slate-600">
                  Digite seu e-mail e enviaremos instruções para recuperar sua senha.
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <span className="material-symbols-outlined text-xl">send</span>
                  Enviar Link de Recuperação
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-green-600">mark_email_read</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">E-mail enviado!</h1>
              <p className="text-slate-600 mb-6">
                Enviamos um link para <strong>{email}</strong>.
                <br />
                Verifique sua caixa de entrada e spam.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Enviar novamente
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Voltar para o login
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-8">
            © 2026 CANNEO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
