import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Verificar sesión y permisos
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

    // Obtener datos de la solicitud
    const { newPassword } = await request.json();

    // Validar contraseña
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' }, 
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();

    // Hashear nueva contraseña
    const hashedPassword = await hash(newPassword, 12);

    // Validar ID del usuario
    let userId;
    try {
      userId = new ObjectId(params.id);
    } catch (idError) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' }, 
        { status: 400 }
      );
    }

    // Actualizar contraseña
    const result = await db.collection('users').updateOne(
      { _id: userId }, 
      { $set: { password: hashedPassword } }
    );
    
    // Verificar si se actualizó correctamente
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Contraseña actualizada correctamente' },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Manejar cualquier error inesperado
    console.error('Error al restablecer contraseña:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al restablecer la contraseña', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}