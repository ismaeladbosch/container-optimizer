// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Depuración - Registra la sesión recibida
    console.log("Sesión en API DELETE /users/[id]:", JSON.stringify(session, null, 2));
    
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
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(params.id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ 
      error: 'Error al eliminar usuario', 
      details: error.message 
    }, { status: 500 });
  }
}