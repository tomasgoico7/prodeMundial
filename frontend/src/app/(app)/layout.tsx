import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen overflow-x-clip bg-background">
        <Navbar />
        <main className="container overflow-x-clip py-8 pb-28 md:pb-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
