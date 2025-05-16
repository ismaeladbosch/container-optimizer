import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

// Mock de usuarios para pruebas
const MOCK_USERS = [
  {
    username: 'admin',
    role: 'admin',
    password: '$2a$10$rI4PyfMjeR5b6PKiZWAGQOmqKA5zcA.7zrbjBj8aEIGNKImLKfeAy' // admin123 hasheado
  }
];

export async function GET() {
  try {
    const adminUser = MOCK_USERS.find(user => user.username === 'admin');
    
    return NextResponse.json({
      status: 'success',
      dbConnection: 'simulated',
      adminExists: !!adminUser,
      adminInfo: adminUser ? {
        username: adminUser.username,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      } : null
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      connectionError: true
    }, { status: 500 });
  }
}