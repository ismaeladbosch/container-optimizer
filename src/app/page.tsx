'use client';
import ContainerOptimizer from '@/components/ContainerOptimizer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  // Optionally use session if needed in the future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = session?.user;

  return (
    <main className="min-h-screen p-4 pt-20">
      <ContainerOptimizer />
    </main>
  );
}