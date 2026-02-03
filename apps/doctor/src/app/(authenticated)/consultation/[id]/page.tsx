'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const patientData = {
  name: 'Maria Silva',
  gender: 'Mulher',
  age: 34,
  height: '165 cm',
  weight: '62 kg',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  visitReason: 'Controle de Dor Crônica',
  visitDescription: 'Consulta de acompanhamento sobre dor lombar e distúrbios do sono.',
  history: [
    { date: '12 Fev, 2023', title: 'Receita Vencida', description: 'Óleo CBD 10% (30ml)' },
    { date: '10 Jan, 2023', title: 'Avaliação Inicial', description: 'Diagnosticada com distensão lombar crônica.' },
    { date: '15 Dez, 2022', title: 'Check-up Geral', description: '' },
  ],
};

export default function ConsultationRoomPage() {
  const params = useParams();
  const [sessionTime, setSessionTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionStarted) {
      interval = setInterval(() => {
        setSessionTime((prev) => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds >= 60) {
            const newMinutes = prev.minutes + 1;
            if (newMinutes >= 60) {
              return { hours: prev.hours + 1, minutes: 0, seconds: 0 };
            }
            return { ...prev, minutes: newMinutes, seconds: 0 };
          }
          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionStarted]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light">
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">CANNEO</h2>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Duração da Sessão
            </span>
          </div>
          <div className="flex gap-1 font-mono text-slate-900 font-bold">
            <span>{formatTime(sessionTime.hours)}</span>:
            <span>{formatTime(sessionTime.minutes)}</span>:
            <span>{formatTime(sessionTime.seconds)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-lg size-10 text-slate-500 hover:bg-slate-100 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button className="flex items-center gap-3 hover:bg-slate-50 pl-2 pr-1 py-1 rounded-full transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">Dr. Ricardo Silva</p>
              <p className="text-xs text-slate-500 mt-0.5">Cardiologista</p>
            </div>
            <div
              className="size-9 rounded-full bg-cover bg-center border border-slate-200"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face)`,
              }}
            />
            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Video Section */}
        <section className="flex-1 flex flex-col relative bg-slate-900 p-4 lg:p-6 overflow-hidden">
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-slate-700/50 group">
            {/* Patient Video */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop)`,
              }}
            >
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            {/* Security Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">lock</span>
                <span className="text-xs font-medium">Criptografia de Ponta a Ponta</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">wifi</span>
                <span className="text-xs font-medium">Qualidade HD</span>
              </div>
            </div>

            {/* Doctor Self View */}
            <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-32 sm:w-48 aspect-video bg-slate-700 rounded-lg overflow-hidden shadow-lg border-2 border-white/10 z-10">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=face)`,
                }}
              />
              <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5">
                <p className="text-[10px] text-white font-medium">Você</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex justify-center items-end pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`size-10 sm:size-11 flex items-center justify-center rounded-full transition-colors ${
                      isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                    } text-white`}
                    title="Mutar Microfone"
                  >
                    <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                  </button>
                  <button
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`size-10 sm:size-11 flex items-center justify-center rounded-full transition-colors ${
                      isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                    } text-white`}
                    title="Desligar Câmera"
                  >
                    <span className="material-symbols-outlined">
                      {isCameraOff ? 'videocam_off' : 'videocam'}
                    </span>
                  </button>
                  <button
                    className="size-10 sm:size-11 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Compartilhar Tela"
                  >
                    <span className="material-symbols-outlined">present_to_all</span>
                  </button>
                </div>
                <div className="w-px h-8 bg-white/20 mx-1"></div>
                <div className="flex items-center gap-3">
                  <button className="hidden lg:flex h-10 sm:h-11 items-center gap-2 px-4 sm:px-5 rounded-full bg-slate-500/30 hover:bg-slate-500/40 text-slate-300 font-semibold text-sm border border-white/5 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[20px]">radio_button_checked</span>
                    <span>Iniciar Gravação</span>
                  </button>
                  {!isSessionStarted ? (
                    <button
                      onClick={() => setIsSessionStarted(true)}
                      className="h-10 sm:h-11 flex items-center gap-2 px-5 sm:px-6 rounded-full bg-primary hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      <span>Iniciar Consulta</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSessionStarted(false)}
                      className="h-10 sm:h-11 flex items-center gap-2 px-4 sm:px-5 rounded-full bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all"
                      title="Encerrar Chamada"
                    >
                      <span className="material-symbols-outlined text-[20px]">call_end</span>
                      <span className="hidden sm:inline">Encerrar Consulta</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Info Sidebar */}
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden transition-all duration-300 z-10 hidden xl:flex">
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Patient Card */}
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <div
                className="size-20 rounded-full bg-cover bg-center mb-3 shadow-sm"
                style={{ backgroundImage: `url(${patientData.avatar})` }}
              />
              <h3 className="text-lg font-bold text-slate-900">{patientData.name}</h3>
              <p className="text-sm text-slate-500 mb-3">
                {patientData.gender}, {patientData.age} anos
              </p>
              <div className="grid grid-cols-2 gap-2 w-full mt-1">
                <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-medium">Altura</span>
                  <span className="text-sm font-semibold text-slate-900">{patientData.height}</span>
                </div>
                <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-medium">Peso</span>
                  <span className="text-sm font-semibold text-slate-900">{patientData.weight}</span>
                </div>
              </div>
            </div>

            {/* Visit Reason */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Motivo da Visita
              </h4>
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-lg">
                    psychology_alt
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{patientData.visitReason}</p>
                    <p className="text-xs text-slate-500 mt-1">{patientData.visitDescription}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical History */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Histórico Clínico
              </h4>
              <div className="space-y-3">
                {patientData.history.map((item, index) => (
                  <div key={index} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-slate-300 mt-2"></div>
                      {index < patientData.history.length - 1 && (
                        <div className="w-px h-full bg-slate-200 my-1"></div>
                      )}
                    </div>
                    <div className={index < patientData.history.length - 1 ? 'pb-3' : ''}>
                      <p className="text-xs text-slate-400 font-medium">{item.date}</p>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full History Button */}
            <div>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">history</span>
                Ver Histórico Completo
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <Link
              href={`/patients/${params.id}`}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all group"
            >
              <span className="material-symbols-outlined group-hover:animate-pulse">folder_open</span>
              Abrir Prontuário
            </Link>
            <Link
              href="/prescriptions/new"
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">medication</span>
              Nova Prescrição
            </Link>
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <button className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white border-l border-t border-b border-slate-200 p-1.5 rounded-l-lg shadow-md xl:hidden z-20 text-slate-500">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      </main>
    </div>
  );
}
