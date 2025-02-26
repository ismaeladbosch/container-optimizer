import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

// Función para generar ID único
export function generateUniqueId(): string {
  return new ObjectId().toString();
}

// GET - Obtener usuarios
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Depuración - Registra la sesión recibida
    console.log("Sesión en API GET /users:", JSON.stringify(session, null, 2));
    
    // Verificar si hay una sesión y si el usuario es administrador
    if (!session) {
      console.log("No hay sesión");
      return NextResponse.json({ error: 'No hay sesión' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log("No hay datos de usuario en la sesión");
      return NextResponse.json({ error: 'Datos de usuario no encontrados' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      console.log(`Rol incorrecto: ${session.user.role}`);
      return NextResponse.json({ error: 'Se requiere rol de administrador' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Crear usuario
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Depuración - Registra la sesión recibida
    console.log("Sesión en API POST /users:", JSON.stringify(session, null, 2));
    
    // Verificar si hay una sesión y si el usuario es administrador
    if (!session) {
      console.log("No hay sesión");
      return NextResponse.json({ error: 'No hay sesión' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log("No hay datos de usuario en la sesión");
      return NextResponse.json({ error: 'Datos de usuario no encontrados' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      console.log(`Rol incorrecto: ${session.user.role}`);
      return NextResponse.json({ error: 'Se requiere rol de administrador' }, { status: 403 });
    }

    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }
    
    // Hash de la contraseña
    const hashedPassword = await hash(password, 12);
    
    // Crear usuario
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      message: 'Usuario creado correctamente',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ 
      error: 'Error al crear usuario', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}