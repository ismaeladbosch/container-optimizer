'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/" 
              className="bg-blue-600 text-white p-6 rounded-lg shadow-lg hover:bg-blue-700">
          <h2 className="text-xl font-bold mb-2">Optimizador de Contenedores</h2>
          <p>Acceder a la aplicación principal</p>
        </Link>
        
        {session?.user?.role === 'admin' && (
          <Link href="/admin/users"
                className="bg-green-600 text-white p-6 rounded-lg shadow-lg hover:bg-green-700">
            <h2 className="text-xl font-bold mb-2">Gestión de Usuarios</h2>
            <p>Administrar usuarios y permisos</p>
          </Link>
        )}
      </div>
    </div>
  );
}