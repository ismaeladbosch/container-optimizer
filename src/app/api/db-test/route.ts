// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    
    return NextResponse.json({
      status: 'success',
      dbConnection: 'working',
      adminExists: !!adminUser,
      adminInfo: adminUser ? {
        username: adminUser.username,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      } : null
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error',
      connectionError: true
    }, { status: 500 });
  }
}