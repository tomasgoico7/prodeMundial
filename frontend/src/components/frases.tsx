'use client';

import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Frases célebres SOLO de futbolistas y técnicos argentinos. */
export const FRASES: { texto: string; autor: string }[] = [
  // Diego Maradona
  { texto: 'La pelota no se mancha.', autor: 'Diego Armando Maradona' },
  { texto: 'Me cortaron las piernas.', autor: 'Diego Armando Maradona' },
  { texto: 'Gracias a la vida, gracias al fútbol, gracias a la pelota.', autor: 'Diego Armando Maradona' },
  { texto: 'Soy blanco o negro; gris, jamás.', autor: 'Diego Armando Maradona' },
  { texto: 'El que abandona no tiene premio.', autor: 'Diego Armando Maradona' },
  // Lionel Messi
  { texto: '¿Qué mirás, bobo? Andá pa’ allá.', autor: 'Lionel Messi' },
  { texto: 'Lo pude lograr. Era lo único que me faltaba.', autor: 'Lionel Messi' },
  { texto: 'Soñaba con ser campeón del mundo con Argentina.', autor: 'Lionel Messi' },
  // Juan Román Riquelme
  { texto: 'Para mí, el fútbol es alegría.', autor: 'Juan Román Riquelme' },
  { texto: 'Me gusta tratar bien a la pelota.', autor: 'Juan Román Riquelme' },
  // César Luis Menotti
  { texto: 'El fútbol es una excusa para ser feliz.', autor: 'César Luis Menotti' },
  { texto: 'El jugador tiene que divertirse.', autor: 'César Luis Menotti' },
  { texto: 'Hay que ser fiel a una idea de juego.', autor: 'César Luis Menotti' },
  // Carlos Salvador Bilardo
  { texto: 'Jugar bien es ganar; jugar mal es perder.', autor: 'Carlos Salvador Bilardo' },
  { texto: 'Esto es fútbol, no es jardín de infantes.', autor: 'Carlos Salvador Bilardo' },
  // Marcelo Bielsa
  { texto: 'El esfuerzo es innegociable.', autor: 'Marcelo Bielsa' },
  { texto: 'El que no corre, no juega.', autor: 'Marcelo Bielsa' },
  { texto: 'Correr es la mayor virtud del deportista.', autor: 'Marcelo Bielsa' },
  { texto: 'El hombre con autocrítica tiene posibilidad de mejorar.', autor: 'Marcelo Bielsa' },
  // Diego Simeone
  { texto: 'Partido a partido.', autor: 'Diego Simeone' },
  { texto: 'El esfuerzo no se negocia.', autor: 'Diego Simeone' },
  // Jorge Valdano
  { texto: 'El fútbol es la cosa más importante de las cosas menos importantes.', autor: 'Jorge Valdano' },
  { texto: 'El fútbol es un estado de ánimo.', autor: 'Jorge Valdano' },
  { texto: 'El fútbol son momentos; el resto es relleno.', autor: 'Jorge Valdano' },
  // Lionel Scaloni
  { texto: 'Tenemos un sueño que queremos hacer realidad.', autor: 'Lionel Scaloni' },
  // Marcelo Gallardo
  { texto: 'Hay que arriesgar para ganar.', autor: 'Marcelo Gallardo' },
];

// Elige un índice al azar distinto del actual (para no repetir la misma frase).
function randomOther(prev: number): number {
  if (FRASES.length < 2) return 0;
  let n = Math.floor(Math.random() * FRASES.length);
  while (n === prev) n = Math.floor(Math.random() * FRASES.length);
  return n;
}

export function FraseCelebre({ className }: { className?: string }) {
  // Arranca en 0 para que SSR y cliente coincidan (sin mismatch de hidratación);
  // recién después de montar se randomiza.
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setI((prev) => randomOther(prev));
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setI((prev) => randomOther(prev));
        setShow(true);
      }, 350);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const frase = FRASES[i];

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur',
        className,
      )}
    >
      <div className="banda-afa absolute inset-y-0 left-0 w-1.5" />
      <Quote className="h-6 w-6 shrink-0 text-sol" />
      <div
        className={cn(
          'transition-all duration-300',
          show ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        <p className="font-display text-base uppercase leading-tight tracking-tight md:text-lg">
          “{frase.texto}”
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
          — {frase.autor}
        </p>
      </div>
    </div>
  );
}
