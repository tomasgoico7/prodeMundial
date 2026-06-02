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

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elprodedelagambeta.vercel.app';

const DESCRIPTION =
  'El Prode del Mundial FIFA 2026, bien de cancha. Armá tu barra, cargá la planilla, bancá a la Scaloneta y peleá la punta de la tabla con tus amigos. Gratis y en tiempo real.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'El Prode de la Gambeta',
    template: '%s · El Prode de la Gambeta',
  },
  description: DESCRIPTION,
  applicationName: 'El Prode de la Gambeta',
  keywords: [
    'prode',
    'prode mundial 2026',
    'mundial 2026',
    'fifa 2026',
    'fútbol argentino',
    'scaloneta',
    'planilla del mundial',
    'predicciones fútbol',
    'pozo entre amigos',
  ],
  authors: [{ name: 'El Prode de la Gambeta' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE,
    siteName: 'El Prode de la Gambeta',
    title: 'El Prode de la Gambeta — Prode del Mundial 2026',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Prode de la Gambeta — Prode del Mundial 2026',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'fu1sL3t20ydIZ4WZSC7ekQAd9Ai4XnZWSfk5H2rwKAk',
  },
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
