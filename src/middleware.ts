import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  if (pathname === '/login' || pathname === '/api/auth') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirige a login si no hay token y está accediendo a rutas protegidas
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifica acceso a rutas de admin
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except:
    // - /api/auth/* (autenticación)
    // - /_next (archivos estáticos de Next.js)
    // - Archivos estáticos como favicon.ico, imágenes, etc.
    // - La página de login
    '/((?!api/auth|_next|.*\\..*|login).*)'
  ],
};