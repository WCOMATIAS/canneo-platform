'use client';

import { useState } from 'react';
import Link from 'next/link';

const specialties = [
  'Todas',
  'Neurologista',
  'Psiquiatra',
  'Clínico Geral',
  'Cardiologista',
  'Dermatologista',
  'Endocrinologista',
];

const doctors = [
  {
    id: '1',
    name: 'Dra. Ana Beatriz Santos',
    specialty: 'Neurologista',
    crm: 'CRM-SP 123456',
    rating: 4.9,
    reviews: 127,
    experience: '12 anos',
    price: 350,
    nextAvailable: 'Hoje, 14:00',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    tags: ['Epilepsia', 'Enxaqueca', 'Parkinson'],
  },
  {
    id: '2',
    name: 'Dr. Carlos Eduardo Lima',
    specialty: 'Psiquiatra',
    crm: 'CRM-SP 234567',
    rating: 4.8,
    reviews: 89,
    experience: '8 anos',
    price: 400,
    nextAvailable: 'Amanhã, 10:00',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    tags: ['Ansiedade', 'Depressão', 'TDAH'],
  },
  {
    id: '3',
    name: 'Dra. Fernanda Costa',
    specialty: 'Clínico Geral',
    crm: 'CRM-RJ 345678',
    rating: 4.7,
    reviews: 203,
    experience: '15 anos',
    price: 250,
    nextAvailable: 'Hoje, 16:30',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    tags: ['Check-up', 'Prevenção', 'Saúde Geral'],
  },
  {
    id: '4',
    name: 'Dr. Roberto Almeida',
    specialty: 'Neurologista',
    crm: 'CRM-SP 456789',
    rating: 4.6,
    reviews: 156,
    experience: '20 anos',
    price: 380,
    nextAvailable: 'Qui, 09:00',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    tags: ['Alzheimer', 'AVC', 'Demência'],
  },
  {
    id: '5',
    name: 'Dra. Maria Helena Souza',
    specialty: 'Psiquiatra',
    crm: 'CRM-MG 567890',
    rating: 4.9,
    reviews: 74,
    experience: '10 anos',
    price: 420,
    nextAvailable: 'Sex, 14:00',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    tags: ['Bipolaridade', 'Esquizofrenia', 'TOC'],
  },
  {
    id: '6',
    name: 'Dr. Pedro Henrique Dias',
    specialty: 'Cardiologista',
    crm: 'CRM-SP 678901',
    rating: 4.8,
    reviews: 112,
    experience: '18 anos',
    price: 380,
    nextAvailable: 'Seg, 11:00',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
    tags: ['Hipertensão', 'Arritmia', 'Infarto'],
  },
];

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === 'Todas' || doctor.specialty === selectedSpecialty;
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Médicos</h1>
          <p className="text-slate-500 mt-1">Encontre o especialista ideal para você</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, especialidade ou condição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>

        {/* Filter by specialty */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSpecialty === specialty
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-900">{filteredDoctors.length}</span> médicos encontrados
        </p>
        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-primary focus:border-primary">
          <option>Ordenar por: Relevância</option>
          <option>Melhor avaliação</option>
          <option>Menor preço</option>
          <option>Maior experiência</option>
          <option>Próxima disponibilidade</option>
        </select>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <Link
            key={doctor.id}
            href={`/doctors/${doctor.id}`}
            className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            {/* Doctor Header */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="size-16 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-primary/20 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-slate-500">{doctor.specialty}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doctor.crm}</p>
                </div>
              </div>

              {/* Rating and Experience */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-400 text-lg filled">star</span>
                  <span className="font-bold text-slate-900">{doctor.rating}</span>
                  <span className="text-sm text-slate-500">({doctor.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-lg">work</span>
                  {doctor.experience}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {doctor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <div>
                <p className="text-xs text-slate-500">Próximo horário</p>
                <p className="font-medium text-primary text-sm">{doctor.nextAvailable}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">A partir de</p>
                <p className="font-bold text-slate-900">
                  R$ {doctor.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum médico encontrado</h3>
          <p className="text-slate-500 text-sm mb-6">Tente ajustar os filtros ou termo de busca</p>
          <button
            onClick={() => {
              setSelectedSpecialty('Todas');
              setSearchQuery('');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
