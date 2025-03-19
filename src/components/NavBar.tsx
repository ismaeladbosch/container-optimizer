// src/components/NavBar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Función para obtener datos del usuario
    async function fetchUserData() {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      // Limpiar datos locales
      setUser(null);
      // Redireccionar a login
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Estado de autenticación
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

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
            {!loading && isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-white px-3 py-2 rounded hover:bg-blue-700">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin/users" className="text-white px-3 py-2 rounded hover:bg-blue-700">
                    Gestión de Usuarios
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            )}
            {!loading && !isAuthenticated && (
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
            {!loading && isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-white block px-3 py-2 rounded hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-white block px-3 py-2 rounded hover:bg-blue-700"
                    onClick={toggleMenu}
                  >
                    Gestión de Usuarios
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white rounded hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            )}
            {!loading && !isAuthenticated && (
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