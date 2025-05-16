import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

// Mock de usuarios para pruebas
const MOCK_USERS = [
  {
    username: 'admin',
    role: 'admin',
    password: '$2a$10$rI4PyfMjeR5b6PKiZWAGQOmqKA5zcA.7zrbjBj8aEIGNKImLKfeAy' // admin123 hasheado
  },
  {
    username: 'user',
    role: 'user',
    password: '$2a$10$someOtherHashedPassword' // ejemplo de otro usuario
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'admin';
    const password = searchParams.get('password') || 'admin123';
    
    // Buscar usuario
    const user = MOCK_USERS.find(u => u.username === username);
    
    let passwordCheckResult = null;
    
    if (user) {
      try {
        passwordCheckResult = await compare(password, user.password);
      } catch (error) {
        passwordCheckResult = `Error al verificar contraseña: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    return NextResponse.json({
      connectionSuccessful: true,
      userExists: !!user,
      userInfo: user ? {
        username: user.username,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      } : null,
      passwordCheckResult
    });
    
  } catch (error) {
    return NextResponse.json({
      connectionSuccessful: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}