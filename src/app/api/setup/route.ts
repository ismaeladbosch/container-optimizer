import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';

// Esta clave debe coincidir con la que usarás en la URL para proteger el endpoint
const SETUP_KEY = 'maricarmen1';

export async function GET(request: Request) {
  // Extraer la clave de la URL
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  // Verificar la clave
  if (key !== SETUP_KEY) {
    return NextResponse.json({ error: 'Clave no válida' }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ username: 'admin' });
    
    if (existingUser) {
      return NextResponse.json({ message: 'El usuario administrador ya existe' }, { status: 200 });
    }
    
    // Crear contraseña hash
    const hashedPassword = await hash('admin123', 12);
    
    // Crear usuario administrador
    await db.collection('users').insertOne({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      message: 'Usuario administrador creado con éxito', 
      username: 'admin',
      password: 'admin123' // Solo mostramos esto porque es un endpoint de configuración
    });
    
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    return NextResponse.json({ 
      error: 'Error al crear usuario administrador', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}