// src/app/api/users/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/options';

// Corrige la definición de la función POST para que coincida con los tipos esperados
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si hay una sesión y si el usuario es administrador
    if (!session) {
      return NextResponse.json({ error: 'No hay sesión' }, { status: 401 });
    }
    
    if (!session.user) {
      return NextResponse.json({ error: 'Datos de usuario no encontrados' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Se requiere rol de administrador' }, { status: 403 });
    }

    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Se requiere contraseña' }, { status: 400 });
    }
    
    const userId = params.id;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Hash de la nueva contraseña
    const hashedPassword = await hash(password, 12);
    
    // Actualizar contraseña
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
    
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return NextResponse.json({ 
      error: 'Error al resetear contraseña', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}