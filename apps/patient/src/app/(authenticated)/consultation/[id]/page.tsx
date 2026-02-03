'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const mockMessages = [
  { id: 1, sender: 'doctor', text: 'Olá Maria! Como você está se sentindo hoje?', time: '14:02' },
  { id: 2, sender: 'patient', text: 'Olá Dra. Ana! Estou me sentindo melhor, mas ainda tenho algumas dúvidas sobre a medicação.', time: '14:03' },
  { id: 3, sender: 'doctor', text: 'Claro, pode me contar mais sobre suas dúvidas. Estou aqui para ajudar.', time: '14:04' },
];

export default function ConsultationRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'patient',
      text: message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleEndCall = () => {
    router.push(`/consultation/${params.id}/summary`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex">
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col ${isChatOpen ? 'mr-80' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/appointments"
                className="flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-white font-bold">Teleconsulta</h1>
                <p className="text-white/70 text-sm">Dra. Ana Beatriz Santos - Neurologista</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
                <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white font-medium text-sm">{formatTime(elapsedTime)}</span>
              </div>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center justify-center size-10 rounded-full transition-colors ${
                  isChatOpen ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span className="material-symbols-outlined">chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Video (Main) */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&h=1080&fit=crop"
              alt="Dra. Ana Beatriz"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* Doctor Name Overlay */}
          <div className="absolute bottom-24 left-6 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
              <span className="material-symbols-outlined text-green-400 text-sm">mic</span>
              <span className="text-white font-medium text-sm">Dra. Ana Beatriz Santos</span>
            </div>
          </div>

          {/* Patient Video (PiP) */}
          <div className="absolute bottom-24 right-6 w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
            {isCameraOff ? (
              <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">videocam_off</span>
                <span className="text-slate-400 text-xs">Câmera desligada</span>
              </div>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face"
                alt="Você"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              <span className={`material-symbols-outlined text-xs ${isMuted ? 'text-red-400' : 'text-green-400'}`}>
                {isMuted ? 'mic_off' : 'mic'}
              </span>
              <span className="text-white text-xs font-medium">Você</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className={`flex items-center justify-center gap-4 ${isChatOpen ? 'mr-80' : ''} transition-all duration-300`}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center justify-center size-14 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isMuted ? 'mic_off' : 'mic'}
              </span>
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`flex items-center justify-center size-14 rounded-full transition-all ${
                isCameraOff
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isCameraOff ? 'Ligar câmera' : 'Desligar câmera'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isCameraOff ? 'videocam_off' : 'videocam'}
              </span>
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`flex items-center justify-center size-14 rounded-full transition-all ${
                isScreenSharing
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isScreenSharing ? 'stop_screen_share' : 'screen_share'}
              </span>
            </button>

            <button
              onClick={handleEndCall}
              className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all font-bold"
            >
              <span className="material-symbols-outlined text-2xl">call_end</span>
              <span>Encerrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white flex flex-col shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">chat</span>
              <h2 className="font-bold text-slate-900">Chat</h2>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'patient'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'patient' ? 'text-white/70' : 'text-slate-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex items-center justify-center size-10 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
