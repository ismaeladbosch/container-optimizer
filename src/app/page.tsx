'use client';
import ContainerOptimizer from '@/components/ContainerOptimizer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Corregir referencia a sessionData por session
  console.log('Session data:', session);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  // Usar session de manera segura
  const currentUser = session?.user || null;

  return (
    <main className="min-h-screen p-4 pt-20">
      {currentUser ? (
        <ContainerOptimizer />
      ) : (
        <div className="flex justify-center items-center h-screen">
          No autorizado
        </div>
      )}
    </main>
  );
}