import type { Metadata, Viewport } from 'next';
import { Oswald, Archivo } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

// Oswald: condensada y deportiva, pero más legible que Anton.
const display = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Archivo: cuerpo de texto deportivo y legible
const sans = Archivo({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'El Prode de la Gambeta',
  description:
    'El Prode de la Gambeta: el Prode del Mundial FIFA 2026, bien de cancha. Armá tu barra, cargá la planilla, bancá a la Scaloneta y peleá la punta de la tabla con tus amigos.',
  keywords: [
    'prode',
    'mundial 2026',
    'fifa',
    'fútbol argentino',
    'scaloneta',
    'planilla',
    'predicciones',
  ],
};

export const viewport: Viewport = {
  themeColor: '#0b1220',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-AR"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
