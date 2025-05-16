import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

// Mock de usuarios para pruebas
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$rI4PyfMjeR5b6PKiZWAGQOmqKA5zcA.7zrbjBj8aEIGNKImLKfeAy', // admin123 hasheado
    role: 'admin'
  },
  {
    id: '2',
    username: 'user',
    password: '$2a$10$someOtherHashedPassword', // ejemplo de otro usuario
    role: 'user'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'admin';
    const password = searchParams.get('password') || 'admin123';
    
    // Simular información de base de datos
    const dbInfo = {
      ok: 1,
      connectionStatus: 'simulated',
      timestamp: new Date().toISOString()
    };
    
    // Buscar usuario
    const user = MOCK_USERS.find(u => u.username === username);
    
    let passwordCheckResult = null;
    let userInfo = null;
    
    if (user) {
      // Extraer información segura del usuario
      userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
        passwordLength: user.password ? user.password.length : 0
      };
      
      // Intentar verificar la contraseña
      try {
        passwordCheckResult = await compare(password, user.password);
      } catch (error) {
        passwordCheckResult = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    return NextResponse.json({
      connectionSuccessful: true,
      dbInfo,
      userExists: !!user,
      userInfo,
      passwordCheckResult,
      testPassword: password
    });
    
  } catch (error) {
    return NextResponse.json({
      connectionSuccessful: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}