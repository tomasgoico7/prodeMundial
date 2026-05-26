import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Papelitos } from '@/components/papelitos';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden cancha-bg chalk-lines p-4">
      <Papelitos />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute left-4 top-4 z-10">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="relative z-10 w-full max-w-md animate-pop-in">
        {children}
        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          ★★★ Vamos que es el Mundial ★★★
        </p>
      </div>
    </div>
  );
}
