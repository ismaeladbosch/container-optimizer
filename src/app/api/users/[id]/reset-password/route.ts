import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { newPassword } = await request.json();

    // Validar la contraseña
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' }, 
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    const result = await db.collection('users').updateOne(
      { _id: params.id },
      { $set: { password: hashedPassword } }
    );

    // Verificar si se actualizó correctamente
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' }, 
      { status: 200 }
    );
  } catch (error) {
    // Manejo de errores con registro detallado
    console.error('Error en reset-password:', error);

    return NextResponse.json(
      { message: 'Error al restablecer la contraseña', details: error instanceof Error ? error.message : 'Error desconocido' }, 
      { status: 500 }
    );
  }
}