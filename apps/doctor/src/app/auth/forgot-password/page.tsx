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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">local_hospital</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">CANNEO</span>
        </div>

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">lock_reset</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Esqueceu sua senha?</h1>
              <p className="text-slate-600">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                Enviar link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">mark_email_read</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">E-mail enviado!</h1>
            <p className="text-slate-600 mb-6">
              Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Não recebeu? Reenviar e-mail
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
