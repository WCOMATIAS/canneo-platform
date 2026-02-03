'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Icon, Button, Card } from '@/components/ui';

const specialties = [
  { id: 1, name: 'Dor Cronica', icon: 'healing', count: 45 },
  { id: 2, name: 'Ansiedade', icon: 'psychology', count: 38 },
  { id: 3, name: 'Epilepsia', icon: 'neurology', count: 22 },
  { id: 4, name: 'Insonia', icon: 'bedtime', count: 31 },
  { id: 5, name: 'Fibromialgia', icon: 'accessibility_new', count: 18 },
  { id: 6, name: 'Parkinson', icon: 'elderly', count: 12 },
];

const featuredDoctors = [
  {
    id: '1',
    name: 'Dra. Maria Santos',
    specialty: 'Neurologista',
    rating: 4.9,
    reviews: 127,
    price: 350,
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Carlos Oliveira',
    specialty: 'Psiquiatra',
    rating: 4.8,
    reviews: 98,
    price: 300,
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Paulo Lima',
    specialty: 'Clinico Geral',
    rating: 4.7,
    reviews: 215,
    price: 250,
    available: true,
  },
];

const steps = [
  {
    icon: 'search',
    title: 'Encontre seu medico',
    description: 'Busque por especialidade ou condicao de saude',
  },
  {
    icon: 'calendar_month',
    title: 'Agende sua consulta',
    description: 'Escolha o melhor horario e faca o pagamento online',
  },
  {
    icon: 'videocam',
    title: 'Consulte online',
    description: 'Realize sua consulta por video e receba sua prescricao',
  },
];

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-400 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Consultas online com especialistas em cannabis medicinal
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Conectamos voce aos melhores medicos prescritores de canabinoides do Brasil.
                Consultas por video, prescricoes digitais e acompanhamento continuo.
              </p>

              {/* Search Box */}
              <div className="bg-white rounded-xl p-2 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Buscar por especialidade ou condicao..."
                    className="w-full px-4 py-3 pl-10 rounded-lg text-gray-900 focus:outline-none"
                  />
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <Link href="/doctors">
                  <Button size="lg" className="px-8">
                    Buscar
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="verified" size="sm" />
                  <span>Medicos verificados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="lock" size="sm" />
                  <span>100% seguro</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-60 h-60 bg-white/10 rounded-full flex items-center justify-center">
                    <Icon name="medical_services" size="xl" className="text-white text-8xl" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Icon name="star" className="text-yellow-500" filled />
                    <span className="font-bold">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">10k+ avaliacoes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Especialidades</h2>
            <p className="text-gray-600">Encontre medicos especializados na sua condicao</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty) => (
              <Link key={specialty.id} href={`/doctors?specialty=${specialty.name}`}>
                <Card hover className="text-center">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon name={specialty.icon} className="text-primary-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{specialty.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{specialty.count} medicos</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-gray-600">Tres passos simples para sua consulta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-primary-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon name={step.icon} size="lg" className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Medicos em Destaque</h2>
              <p className="text-gray-600">Profissionais bem avaliados e com agenda disponivel</p>
            </div>
            <Link href="/doctors">
              <Button variant="outline" icon="arrow_forward" iconPosition="right">
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon name="person" size="lg" className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="star" size="sm" className="text-yellow-500" filled />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-xs text-gray-400">({doctor.reviews} avaliacoes)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Consulta</p>
                    <p className="text-lg font-bold text-gray-900">R$ {doctor.price}</p>
                  </div>
                  <Link href={`/schedule/${doctor.id}`}>
                    <Button size="sm" icon="calendar_month">
                      Agendar
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para comecar seu tratamento?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e agende sua primeira consulta com um especialista.
          </p>
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="bg-white text-secondary-600 hover:bg-gray-100">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
