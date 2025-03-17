'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState('checking...');
  const router = useRouter();

  // Función para verificar la base de datos
  useEffect(() => {
    async function checkDatabase() {
      try {
        console.log("Intentando conectar a la base de datos...");
        const { db } = await connectToDatabase();
        console.log("Conexión establecida, buscando usuarios...");
        
        const users = await db.collection('users').find({}).toArray();
        console.log("Usuarios encontrados:", users.length);
        
        if (users.length > 0) {
          const safeUsers = users.map(u => ({
            username: u.username,
            role: u.role,
            hasPassword: !!u.password
          }));
          console.log("Información de usuarios:", safeUsers);
          setDbStatus(`Conexión exitosa: ${users.length} usuarios encontrados`);
        } else {
          console.log("No se encontraron usuarios");
          setDbStatus("No se encontraron usuarios en la base de datos");
        }
      } catch (error) {
        console.error("Error conectando a la base de datos:", error);
        setDbStatus(`Error: ${error.message}`);
      }
    }
    
    checkDatabase();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con:", username);
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      console.log("Resultado del inicio de sesión:", result);
      
      if (result?.error) {
        console.error("Error de inicio de sesión:", result.error);
        setError('Credenciales inválidas');
      } else {
        console.log("Inicio de sesión exitoso, redirigiendo...");
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Estado de BD: {dbStatus}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}