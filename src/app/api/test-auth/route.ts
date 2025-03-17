// src/app/api/test-auth/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'admin';
    const password = searchParams.get('password') || 'admin123';
    
    const { db } = await connectToDatabase();
    
    // Verificar conexión a la base de datos
    const dbInfo = await db.command({ ping: 1 });
    
    // Buscar usuario
    const user = await db.collection('users').findOne({ username });
    
    let passwordCheckResult = null;
    let userInfo = null;
    
    if (user) {
      // Extraer información segura del usuario
      userInfo = {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        passwordLength: user.password ? user.password.length : 0
      };
      
      // Intentar verificar la contraseña
      try {
        passwordCheckResult = await compare(password, user.password);
      } catch (error) {
        passwordCheckResult = `Error: ${error.message}`;
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
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}