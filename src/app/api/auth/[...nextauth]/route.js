import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { username, password } = data;
    
    // Autenticación simple hardcodeada
    if (username === 'admin' && password === 'admin123') {
      // Crear un token simple (no JWT real)
      const token = Buffer.from(JSON.stringify({
        name: 'Admin User',
        role: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
      })).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token,
        user: { name: 'Admin User', role: 'admin' }
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error de servidor' },
      { status: 500 }
    );
  }
}