import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar tokens
const SECRET_KEY = 'maricarmen1_secret_key_container_optimizer';

export async function POST(request) {
  try {
    // Extraer credenciales del cuerpo de la solicitud
    const { username, password } = await request.json();
    
    console.log("Intento de login:", username);
    
    // Autenticación simple (hardcoded)
    if (username === 'admin' && password === 'admin123') {
      console.log("Credenciales correctas para:", username);
      
      // Crear token JWT
      const token = jwt.sign(
        { 
          username,
          role: 'admin',
          name: 'Administrador' 
        },
        SECRET_KEY,
        { expiresIn: '24h' }
      );
      
      // Crear respuesta con mensaje de éxito
      const response = NextResponse.json({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        user: { username, role: 'admin' }
      });
      
      // Establecer cookie con el token JWT
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 86400, // 24 horas en segundos
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    }
    
    console.log("Credenciales inválidas para:", username);
    
    // Si las credenciales son incorrectas
    return NextResponse.json(
      { success: false, message: 'Usuario o contraseña incorrectos' },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error en API de login:", error);
    
    // Error del servidor
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}