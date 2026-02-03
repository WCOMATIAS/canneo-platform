import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CANNEO - Painel Médico',
  description: 'Portal do Médico - CANNEO Telemedicina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="antialiased bg-background-light">{children}</body>
    </html>
  );
}
