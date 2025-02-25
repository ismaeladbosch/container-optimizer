// src/components/NavBar.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 fixed w-full z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              Optimizador de Contenedores
            </Link>
          </div>

          {/* Para pantallas grandes */}
          <div className="hidden md:flex md:items-center">
            {status === 'authenticated' && (
              <>
                <Link href="/dashboard" className="text-white px-3 py-2 rounded hover:bg-blue-700">
                  Dashboard
                </Link>
                {session?.user?.role === 'admin' && (
                  <Link href="/admin/users" className="text-white px-3 py-2 rounded hover:bg-blue-700">
                    Gestión de Usuarios
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            )}
            {status === 'unauthenticated' && (
              <Link href="/login" className="text-white px-3 py-2 rounded hover:bg-blue-700">
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Menú hamburguesa para móviles */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-600">
            {status === 'authenticated' && (
              <>
                <Link
                  href="/dashboard"
                  className="text-white block px-3 py-2 rounded hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin/users"
                    className="text-white block px-3 py-2 rounded hover:bg-blue-700"
                    onClick={toggleMenu}
                  >
                    Gestión de Usuarios
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full text-left px-3 py-2 text-white rounded hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            )}
            {status === 'unauthenticated' && (
              <Link
                href="/login"
                className="text-white block px-3 py-2 rounded hover:bg-blue-700"
                onClick={toggleMenu}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}