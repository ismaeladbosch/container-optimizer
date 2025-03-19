// src/app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear respuesta
    const response = NextResponse.json({ 
      success: true, 
      message: 'Sesión cerrada correctamente'
    });
    
    // Eliminar la cookie de autenticación
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { success: false, message: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}