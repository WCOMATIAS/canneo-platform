'use client';

import { useState } from 'react';
import Link from 'next/link';

const doctors = [
  {
    id: '1',
    name: 'Dra. Ana Beatriz Santos',
    specialty: 'Neurologista',
    experience: '8 anos',
    rating: 4.9,
    reviews: 124,
    price: 350,
    tags: ['Dor Crônica', 'Ansiedade', 'Epilepsia'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    online: true,
    slots: ['Hoje, 14:00', 'Hoje, 16:30', 'Amanhã, 09:00'],
  },
  {
    id: '2',
    name: 'Dr. Carlos Eduardo Lima',
    specialty: 'Psiquiatra',
    experience: '15 anos',
    rating: 4.7,
    reviews: 86,
    price: 400,
    tags: ['Ansiedade', 'Depressão', 'Insônia'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    online: false,
    slots: ['Amanhã, 10:00', 'Amanhã, 14:00', 'Qua, 09:00'],
  },
  {
    id: '3',
    name: 'Dra. Fernanda Costa',
    specialty: 'Clínica Geral',
    experience: '12 anos',
    rating: 5.0,
    reviews: 42,
    price: 280,
    tags: ['Consulta Geral', 'Dor Crônica'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
    online: true,
    slots: ['Qua, 15:00', 'Qui, 11:00'],
  },
];

export default function ScheduleAppointmentPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>(['all']);

  return (
    <div className="flex flex-col gap-8">
      {/* Progress Steps */}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max w-full justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>

          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/30 ring-4 ring-slate-50 transition-all">
              <span className="material-symbols-outlined text-xl">person_search</span>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">1. Escolher Médico</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10 opacity-60">
            <div className="size-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold ring-4 ring-slate-50">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
            </div>
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">2. Escolher Data/Hora</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10 opacity-60">
            <div className="size-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold ring-4 ring-slate-50">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
            </div>
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">3. Checkout</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10 opacity-60">
            <div className="size-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold ring-4 ring-slate-50">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">4. Confirmação</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5">info</span>
        <div>
          <h3 className="text-primary font-bold text-sm mb-1">Nota Importante</h3>
          <p className="text-slate-600 text-sm">A consulta só será confirmada após o pagamento.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-5 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Filtros</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">Limpar Tudo</button>
          </div>

          {/* Specialty Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-slate-900">Especialidade</label>
            <div className="space-y-2">
              {['Dor Crônica', 'Ansiedade', 'Insônia', 'Consulta Geral'].map((spec) => (
                <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-slate-900">Avaliação</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="rating" className="text-primary focus:ring-primary border-slate-300" />
                <div className="flex items-center text-yellow-500">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span className="text-sm text-slate-600 ml-2 group-hover:text-primary transition-colors">e acima</span>
                </div>
              </label>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-slate-900">Disponibilidade</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary border-slate-300" />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">Disponível Hoje</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-slate-300" />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">Próximos 3 dias</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium rounded-lg transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        {/* Doctors List */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold">
              Médicos Disponíveis <span className="text-slate-400 font-normal text-base ml-2">({doctors.length} resultados)</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden sm:inline">Ordenar por:</span>
              <select className="bg-transparent border-none text-sm font-medium text-slate-900 focus:ring-0 py-1 pr-8 pl-0 cursor-pointer">
                <option>Recomendado</option>
                <option>Preço: Menor para Maior</option>
                <option>Melhor Avaliados</option>
              </select>
            </div>
          </div>

          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Avatar */}
                <div className="shrink-0 relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-slate-200 overflow-hidden">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {doctor.online && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> ONLINE
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                      <p className="text-sm text-slate-500">{doctor.specialty} • {doctor.experience} de experiência</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-sm font-bold">{doctor.rating}</span>
                      <span className="text-xs opacity-80">({doctor.reviews} avaliações)</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Valor da Consulta</p>
                      <p className="text-lg font-bold text-slate-900">R$ {doctor.price.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="text-xs text-slate-500 mb-2 sm:text-right">Próximos horários:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 sm:justify-end">
                        {doctor.slots.map((slot, index) => (
                          <button
                            key={slot}
                            className={`shrink-0 px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors ${
                              index === 0
                                ? 'border-primary text-primary bg-primary/5 hover:bg-primary hover:text-white font-semibold'
                                : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/appointments/checkout?doctor=${doctor.id}`}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-sm shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    >
                      Selecionar Médico
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          <div className="pt-4 flex justify-center">
            <button className="flex items-center gap-2 text-slate-500 hover:text-primary font-medium transition-colors">
              Mostrar mais médicos
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
