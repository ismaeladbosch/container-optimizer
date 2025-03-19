
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'maricarmen1_secret_key_container_optimizer';

export async function GET(request) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    try {
      const decoded = jwt.verify(authToken, SECRET_KEY);
      
      return NextResponse.json({
        user: {
          name: decoded.name,
          role: decoded.role,
          username: decoded.username,
        }
      });
    } catch (error) {
      console.error('Error verificando token:', error);
      return NextResponse.json({ user: null }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en API /me:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}