import Link from 'next/link';
import {
  Users,
  Radio,
  ListOrdered,
  PenLine,
  ClipboardList,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Papelitos } from '@/components/papelitos';
import { FraseCelebre } from '@/components/frases';

const FEATURES = [
  {
    icon: Users,
    title: 'Armá tu barra',
    desc: 'El grupo de la oficina, los pibes del barrio o la familia. Pasás el código de invitación y a jugar. Cada barra con su tabla.',
  },
  {
    icon: Radio,
    title: 'El marcador, en vivo',
    desc: 'Los resultados y la tabla se actualizan solos, fecha a fecha. Te enterás al toque si pegaste el pleno.',
  },
  {
    icon: ListOrdered,
    title: 'La tabla de posiciones',
    desc: 'Quién es puntero y quién se va derechito al descenso. Plenos, aciertos y promedios de toda la barra.',
  },
  {
    icon: Flame,
    title: 'Una sola planilla',
    desc: 'Cargás tu prode una vez y queda firmado. Acá no hay mufa ni revancha: jugás de una y la bancás.',
  },
];

const PASOS = [
  { n: '1', t: 'Creá tu cuenta', d: 'En 30 segundos, sin vueltas.' },
  { n: '2', t: 'Armá o sumate a una barra', d: 'Con el código de invitación.' },
  { n: '3', t: 'Cargá la planilla', d: 'Resultados + tu campeón del mundo.' },
  { n: '4', t: 'Peleá la punta', d: 'Y cargá al último de la tabla.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden cancha-bg chalk-lines">
      <Papelitos />

      <header className="container relative z-10 flex h-16 items-center justify-between gap-2">
        <Link href="/" className="min-w-0">
          <Logo />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild size="sm" className="sm:h-10 sm:px-4">
            <Link href="/register">
              <span className="sm:hidden">Crear</span>
              <span className="hidden sm:inline">Crear cuenta</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="container relative z-10">
        {/* Hero */}
        <section className="flex flex-col items-center py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <span className="text-sol">★★★</span>
            Mundial FIFA 2026 · 48 selecciones · 104 partidos
          </div>

          <h1 className="max-w-4xl font-display text-5xl uppercase leading-[0.92] tracking-tight md:text-8xl">
            El prode del{' '}
            <span className="text-celeste">Mundial</span>,
            <br className="hidden md:block" /> bien de cancha
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Cargá tu planilla, bancá a la Scaloneta y cargá a tus amigos cuando
            queden últimos en la tabla. El Prode de toda la vida, ahora con tu
            barra y en tiempo real.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="text-base">
              <Link href="/register">
                <ClipboardList className="h-5 w-5" /> Armar mi planilla
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
              <Link href="/login">Ya tengo equipo</Link>
            </Button>
          </div>

          {/* Marcador / números grandes */}
          <div className="mt-12 grid w-full max-w-3xl grid-cols-3 gap-2 sm:gap-4">
            {[
              { k: '48', v: 'Selecciones' },
              { k: '104', v: 'Partidos' },
              { k: '★★★', v: 'Estrellas' },
            ].map((s, i) => (
              <Card key={s.v} className="animate-pop-in glass" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="px-2 py-4 text-center sm:p-5">
                  <div className="font-display text-2xl leading-none text-celeste sm:text-3xl md:text-4xl">
                    {s.k}
                  </div>
                  <div className="mt-1.5 text-[10px] uppercase leading-tight tracking-wide text-muted-foreground sm:text-xs md:text-sm">
                    {s.v}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Frase célebre */}
        <section className="pb-4">
          <div className="mx-auto max-w-3xl">
            <FraseCelebre />
          </div>
        </section>

        {/* Cómo se juega */}
        <section className="pb-6">
          <h2 className="mb-6 text-center font-display text-2xl uppercase tracking-tight md:text-3xl">
            Cómo se juega
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p) => (
              <Card key={p.n} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <span className="font-display text-5xl text-primary/20">
                    {p.n}
                  </span>
                  <h3 className="mt-1 font-display text-lg uppercase tracking-tight">
                    {p.t}
                  </h3>
                  <p className="text-sm text-muted-foreground">{p.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sistema de puntaje (estilo planilla / quiniela) */}
        <section className="py-10">
          <Card className="overflow-hidden border-2 border-dashed border-primary/30">
            <div className="banda-afa h-1.5 w-full" />
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              {[
                { p: '+3', t: 'Pleno', d: 'Le pegaste al resultado exacto.' },
                { p: '+1', t: 'Acierto', d: 'Acertaste el ganador (o el empate).' },
                { p: '+10', t: 'Campeón', d: 'Tu campeón del mundo, clavado.' },
              ].map((s) => (
                <div key={s.t} className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-foreground font-display text-2xl text-background">
                    {s.p}
                  </span>
                  <div>
                    <p className="font-display text-lg uppercase tracking-tight">
                      {s.t}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section className="grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group transition-transform hover:-translate-y-1"
            >
              <CardContent className="space-y-3 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg uppercase tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <Logo showStars={false} />
          <p className="text-center">
            Hecho por Tomas Goicoechea.{' '}
            <span className="text-sol">★★★</span> · Vamos, vamos, Argentina.
          </p>
        </div>
      </footer>
    </div>
  );
}
