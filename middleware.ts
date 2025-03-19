// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'maricarmen1_secret_key_container_optimizer';

export function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/login'];
  
  // Comprobar si la ruta actual es pública
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar token de autenticación
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirigir a login si no hay token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar el token
    jwt.verify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (error) {
    // Token inválido o expirado
    console.error('Error de autenticación:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configurar las rutas que usarán este middleware
export const config = {
  matcher: [
    '/((?!api/login|login|_next/static|_next/image|favicon.ico).*)',
  ],
};