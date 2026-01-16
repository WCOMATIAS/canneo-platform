import { Leaf } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-canneo-600 to-canneo-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">CANNEO</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Telemedicina especializada em Cannabis Medicinal
          </h1>
          <p className="text-canneo-100 text-lg">
            Plataforma completa para gestao de consultas, prescricoes e laudos
            ANVISA. Simplifique sua pratica medica.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">80%</div>
              <div className="text-canneo-100 text-sm">
                Reducao na burocracia
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-canneo-100 text-sm">Compliance ANVISA</div>
            </div>
          </div>
        </div>

        <div className="text-canneo-200 text-sm">
          © 2026 CANNEO. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
