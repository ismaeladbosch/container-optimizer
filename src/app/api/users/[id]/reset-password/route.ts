import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Omitir la sesión si no se va a usar
    await getServerSession();

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Se requiere contraseña' }, { status: 400 });
    }
    const hashedPassword = await hash(password, 12);
    
    const { db } = await connectToDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { password: hashedPassword } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error al actualizar contraseña' }, { status: 500 });
  }
}