import { cn } from '@/lib/utils';

// Papelitos de tribuna: celeste, blanco y dorado cayendo como en la previa.
// Valores fijos (no aleatorios) para evitar mismatch de hidratación.
const PAPELES = [
  { left: '6%', delay: '0s', dur: '9s', color: 'hsl(var(--primary))', rot: '12deg' },
  { left: '15%', delay: '1.4s', dur: '11s', color: '#ffffff', rot: '-8deg' },
  { left: '24%', delay: '3.1s', dur: '8.5s', color: 'hsl(var(--accent))', rot: '20deg' },
  { left: '33%', delay: '0.7s', dur: '12s', color: 'hsl(var(--primary))', rot: '-15deg' },
  { left: '44%', delay: '2.2s', dur: '9.5s', color: '#ffffff', rot: '6deg' },
  { left: '53%', delay: '4s', dur: '10.5s', color: 'hsl(var(--accent))', rot: '-22deg' },
  { left: '63%', delay: '1s', dur: '8s', color: 'hsl(var(--primary))', rot: '14deg' },
  { left: '72%', delay: '3.6s', dur: '11.5s', color: '#ffffff', rot: '-5deg' },
  { left: '81%', delay: '0.4s', dur: '9.8s', color: 'hsl(var(--accent))', rot: '18deg' },
  { left: '90%', delay: '2.7s', dur: '10s', color: 'hsl(var(--primary))', rot: '-12deg' },
  { left: '96%', delay: '1.9s', dur: '12.5s', color: '#ffffff', rot: '9deg' },
];

export function Papelitos({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {PAPELES.map((p, i) => (
        <span
          key={i}
          className="papel"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.dur,
            backgroundColor: p.color,
            transform: `rotate(${p.rot})`,
            borderRadius: i % 3 === 0 ? '2px' : '0',
          }}
        />
      ))}
    </div>
  );
}
