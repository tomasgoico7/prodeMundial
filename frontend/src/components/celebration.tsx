'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

/** Confeti de colores a pantalla completa (canvas, sin dependencias). */
function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const COLORS = [
      '#38bdf8',
      '#0ea5e9',
      '#f5b50a',
      '#ffffff',
      '#22c55e',
      '#ef4444',
      '#a855f7',
      '#f97316',
    ];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const make = () => ({
      x: rnd(0, w),
      y: rnd(-h, 0),
      w: rnd(6, 11),
      h: rnd(8, 15),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: rnd(1.6, 4),
      vx: rnd(-1.2, 1.2),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.16, 0.16),
      sway: rnd(0, Math.PI * 2),
    });

    const parts = Array.from({ length: 190 }, make);
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = rnd(0, w);
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden
    />
  );
}

/** Overlay de campeón: "¡Dale campeón, dale campeón!" + confeti. */
export function ChampionCelebration({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Confetti />
      <div className="relative z-[70] w-full max-w-md animate-pop-in overflow-hidden rounded-2xl border-2 border-accent/50 bg-card p-8 text-center shadow-2xl">
        <div className="banda-afa absolute inset-x-0 top-0 h-1.5" />
        <div className="text-7xl drop-shadow-lg">🏆</div>
        <h2 className="mt-4 font-display text-3xl uppercase leading-[0.95] tracking-tight text-celeste sm:text-4xl">
          ¡Dale campeón,
          <br />
          dale campeón!
        </h2>
        <p className="mt-3 text-muted-foreground">
          <span className="font-bold text-foreground">{name}</span>, ganaste el
          prode. La levantaste.
        </p>
        <Button variant="accent" className="mt-6 w-full" onClick={onClose}>
          ¡Gracias, gracias!
        </Button>
      </div>
    </div>
  );
}
