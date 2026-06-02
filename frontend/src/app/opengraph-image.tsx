import { ImageResponse } from 'next/og';

export const alt = 'El Prode de la Gambeta — Prode del Mundial 2026';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b2a4a 0%, #0284c7 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            letterSpacing: 14,
            color: '#f5b50a',
            marginBottom: 28,
          }}
        >
          ★ ★ ★
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.05,
          }}
        >
          EL PRODE DE LA GAMBETA
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 42,
            marginTop: 28,
            color: '#cfe8fb',
          }}
        >
          El Prode del Mundial 2026
        </div>
      </div>
    ),
    { ...size },
  );
}
