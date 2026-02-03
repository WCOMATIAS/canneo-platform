'use client';

import { useState } from 'react';
import Link from 'next/link';

const doctor = {
  id: '1',
  name: 'Dra. Ana Beatriz Santos',
  specialty: 'Neurologista',
  crm: 'CRM-SP 123456',
  rating: 4.9,
  reviews: 127,
  experience: '12 anos de experiência',
  about:
    'Especialista em Neurologia com ênfase em epilepsia, enxaqueca e doenças neurodegenerativas. Formada pela USP com residência no Hospital das Clínicas. Atuo com uma abordagem humanizada, focando no bem-estar integral do paciente.',
  education: [
    { degree: 'Graduação em Medicina', institution: 'Universidade de São Paulo (USP)', year: '2008' },
    { degree: 'Residência em Neurologia', institution: 'Hospital das Clínicas - FMUSP', year: '2012' },
    { degree: 'Fellowship em Epilepsia', institution: 'Cleveland Clinic, EUA', year: '2014' },
  ],
  specializations: ['Epilepsia', 'Enxaqueca', 'Parkinson', 'Alzheimer', 'Esclerose Múltipla'],
  languages: ['Português', 'Inglês', 'Espanhol'],
  consultationPrice: 350,
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
};

const reviews = [
  {
    id: 1,
    patient: 'Maria S.',
    rating: 5,
    date: '20 Jan, 2026',
    comment: 'Excelente profissional! Muito atenciosa e explicou tudo com clareza. Recomendo muito.',
    tags: ['Atenciosa', 'Explicou bem', 'Pontual'],
  },
  {
    id: 2,
    patient: 'João P.',
    rating: 5,
    date: '15 Jan, 2026',
    comment: 'A Dra. Ana foi muito cuidadosa e competente. Senti confiança desde o primeiro momento.',
    tags: ['Profissional', 'Empática'],
  },
  {
    id: 3,
    patient: 'Carla M.',
    rating: 4,
    date: '10 Jan, 2026',
    comment: 'Ótimo atendimento, consulta bem detalhada. Só demorou um pouco para começar.',
    tags: ['Atenciosa', 'Resolveu meu problema'],
  },
];

const availableSlots = [
  { date: 'Hoje', day: '31 Jan', slots: ['14:00', '15:00', '16:00', '17:00'] },
  { date: 'Amanhã', day: '01 Fev', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { date: 'Sábado', day: '02 Fev', slots: ['09:00', '10:00', '11:00'] },
];

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href="/doctors"
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium w-fit"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar para Médicos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Doctor Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="size-32 rounded-2xl object-cover ring-4 ring-slate-100"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
                    <p className="text-slate-500">{doctor.specialty}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{doctor.crm}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-yellow-400 filled">star</span>
                    <span className="font-bold text-slate-900">{doctor.rating}</span>
                    <span className="text-slate-500">({doctor.reviews} avaliações)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="material-symbols-outlined">work</span>
                    {doctor.experience}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      <span className="material-symbols-outlined text-sm">translate</span>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'text-primary border-primary'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'text-primary border-primary'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              Avaliações ({doctor.reviews})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'about' ? (
            <div className="flex flex-col gap-6">
              {/* About */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Sobre
                </h3>
                <p className="text-slate-600 leading-relaxed">{doctor.about}</p>
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  Formação
                </h3>
                <div className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        <span className="material-symbols-outlined">verified</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{edu.degree}</p>
                        <p className="text-sm text-slate-500">{edu.institution}</p>
                        <p className="text-xs text-slate-400">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">medical_services</span>
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Reviews Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900">{doctor.rating}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-lg ${
                            star <= Math.round(doctor.rating) ? 'text-yellow-400 filled' : 'text-slate-300'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{doctor.reviews} avaliações</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 w-3">{star}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width: star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '10%' : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {review.patient[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{review.patient}</p>
                        <p className="text-xs text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-sm ${
                            star <= review.rating ? 'text-yellow-400 filled' : 'text-slate-300'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{review.comment}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Agendar Consulta</h3>
              <p className="text-sm text-slate-500">Selecione o melhor horário para você</p>
            </div>

            {/* Date Selection */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex gap-2 overflow-x-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDate(index);
                      setSelectedSlot(null);
                    }}
                    className={`flex flex-col items-center px-4 py-3 rounded-lg min-w-[80px] transition-colors ${
                      selectedDate === index
                        ? 'bg-primary text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-medium">{slot.date}</span>
                    <span className="font-bold">{slot.day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-sm text-slate-500 mb-3">Horários disponíveis</p>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots[selectedDate].slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSlot === slot
                        ? 'bg-primary text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Price and Book */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500">Valor da consulta</span>
                <span className="text-2xl font-bold text-slate-900">
                  R$ {doctor.consultationPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <Link
                href={`/appointments/checkout?doctor=${doctor.id}&date=${availableSlots[selectedDate].day}&time=${selectedSlot || ''}`}
                className={`flex items-center justify-center gap-2 w-full h-12 rounded-lg font-bold transition-all ${
                  selectedSlot
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                onClick={(e) => !selectedSlot && e.preventDefault()}
              >
                <span className="material-symbols-outlined">calendar_add_on</span>
                Agendar Consulta
              </Link>
              <p className="text-xs text-slate-400 text-center mt-3">
                Cancelamento gratuito até 24h antes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
