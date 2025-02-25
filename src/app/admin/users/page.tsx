'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  role: string;
}

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Estado de autenticación:", status);
    console.log("Sesión:", session);
    
    if (status === 'loading') {
      return; // Esperando a que se cargue la sesión
    }
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      // Verificar si es admin
      if (session?.user?.role !== 'admin') {
        setError('Acceso denegado: Se requiere rol de administrador');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
      
      // Si es admin, cargar usuarios
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de sesión
      });

      console.log("Respuesta API:", response.status);
      
      if (response.status === 401 || response.status === 403) {
        const data = await response.json();
        setError(`Error de autenticación: ${data.error}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);
      setUsers(data || []);
      setError('');
    } catch (error) {
      console.error("Error en fetchUsers:", error);
      setError(`Error al cargar usuarios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newUser.username || !newUser.password) {
        setError('Por favor completa todos los campos');
        return;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
        credentials: 'include', // Importante para enviar cookies
      });

      if (response.status === 401 || response.status === 403) {
        const data = await response.json();
        setError(`Error de autenticación: ${data.error}`);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setSuccess('Usuario creado correctamente');
      setNewUser({ username: '', password: '', role: 'user' });
      fetchUsers(); // Recargar la lista
    } catch (error) {
      console.error("Error en createUser:", error);
      setError(`Error al crear usuario: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        const data = await response.json();
        setError(`Error de autenticación: ${data.error}`);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setSuccess('Usuario eliminado correctamente');
      fetchUsers(); // Recargar la lista
    } catch (error) {
      console.error("Error en deleteUser:", error);
      setError(`Error al eliminar usuario: ${error.message}`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {status === 'authenticated' && session?.user?.role === 'admin' && (
        <>
          {/* Formulario para crear usuario */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear Usuario
              </button>
            </form>
          </div>

          {/* Lista de usuarios */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Usuarios Existentes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center">
                        No hay usuarios para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Depuración */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Información de Depuración:</h3>
        <p>Estado de autenticación: {status}</p>
        <p>Usuario: {session?.user?.username || 'No hay sesión'}</p>
        <p>Rol: {session?.user?.role || 'No hay rol'}</p>
        <details>
          <summary>Datos completos de sesión</summary>
          <pre className="bg-gray-200 p-2 mt-2 text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}