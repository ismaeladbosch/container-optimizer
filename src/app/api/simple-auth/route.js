import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';

export async function POST(request) {
  try {
    const data = await request.json();
    const { username, password } = data;
    
    // Autenticación básica hardcodeada
    if (username === 'admin' && password === 'admin123') {
      // Crear un token JWT para el usuario
      const token = jwt.sign(
        { 
          name: 'Admin User',
          role: 'admin',
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Crear respuesta con cookie HTTP-only
      const response = NextResponse.json({ 
        success: true, 
        user: { name: 'Admin User', role: 'admin' }
      });
      
      // Establecer cookie con el token
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error de autenticación:', error);
    return NextResponse.json(
      { success: false, message: 'Error de servidor' },
      { status: 500 }
    );
  }
}