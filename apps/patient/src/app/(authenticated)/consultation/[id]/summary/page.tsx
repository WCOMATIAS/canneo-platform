'use client';

import { useState } from 'react';
import Link from 'next/link';

const feedbackTags = [
  { id: 1, label: 'Pontual', icon: 'schedule' },
  { id: 2, label: 'Atencioso(a)', icon: 'favorite' },
  { id: 3, label: 'Explicou bem', icon: 'lightbulb' },
  { id: 4, label: 'Profissional', icon: 'verified' },
  { id: 5, label: 'Empático(a)', icon: 'emoji_people' },
  { id: 6, label: 'Resolveu meu problema', icon: 'check_circle' },
];

const documents = [
  { id: 1, type: 'Receita Médica', icon: 'medication', filename: 'receita_ana_beatriz_31012026.pdf' },
  { id: 2, type: 'Atestado Médico', icon: 'description', filename: 'atestado_ana_beatriz_31012026.pdf' },
  { id: 3, type: 'Pedido de Exames', icon: 'biotech', filename: 'exames_ana_beatriz_31012026.pdf' },
];

export default function ConsultationSummaryPage({ params }: { params: { id: string } }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitFeedback = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100 border-2 border-green-500 text-green-500">
            <span className="material-symbols-outlined text-4xl">check</span>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consulta Finalizada</h1>
          <p className="text-slate-500 mt-1">Sua teleconsulta foi concluída com sucesso</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Consultation Info */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
              alt="Dra. Ana Beatriz"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Dra. Ana Beatriz Santos</h3>
              <p className="text-sm text-slate-500">Neurologista</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                  31 Jan, 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  14:00 - 14:32
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">timer</span>
                  32 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">folder</span>
            Documentos da Consulta
          </h4>
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">{doc.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.type}</p>
                    <p className="text-xs text-slate-500">{doc.filename}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                  <button className="flex items-center justify-center size-9 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        {!isSubmitted ? (
          <div className="p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              Avalie sua Consulta
            </h4>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined text-4xl ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 filled'
                        : 'text-slate-300'
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <>
                {/* Feedback Tags */}
                <div className="mb-6">
                  <p className="text-sm text-slate-600 mb-3 text-center">O que você mais gostou?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {feedbackTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{tag.icon}</span>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Written Feedback */}
                <div className="mb-6">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Deixe um comentário sobre sua experiência (opcional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitFeedback}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
                >
                  <span className="material-symbols-outlined">send</span>
                  Enviar Avaliação
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center text-center py-6">
              <div className="flex items-center justify-center size-16 rounded-full bg-green-100 text-green-500 mb-4">
                <span className="material-symbols-outlined text-3xl">thumb_up</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Obrigado pelo seu feedback!</h4>
              <p className="text-sm text-slate-500">Sua avaliação nos ajuda a melhorar nossos serviços.</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
        <Link
          href="/appointments"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-medium transition-colors"
        >
          <span className="material-symbols-outlined">calendar_month</span>
          Ver Minhas Consultas
        </Link>
        <Link
          href="/appointments/new"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Agendar Nova Consulta
        </Link>
      </div>

      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="mt-6 text-primary hover:text-primary/80 font-medium flex items-center gap-2"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar ao Início
      </Link>
    </div>
  );
}
