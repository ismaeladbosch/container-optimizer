// src/app/api/public-test/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'admin';
    const password = searchParams.get('password') || 'admin123';
    
    const { db } = await connectToDatabase();
    
    // Buscar usuario
    const user = await db.collection('users').findOne({ username });
    
    let passwordCheckResult = null;
    
    if (user) {
      try {
        passwordCheckResult = await compare(password, user.password);
      } catch (error) {
        passwordCheckResult = `Error al verificar contraseña: ${error.message}`;
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
      error: error.message
    }, { status: 500 });
  }
}