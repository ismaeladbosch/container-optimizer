// src/app/api/auth/[...nextauth]/route.js (cambia la extensión de .ts a .js)
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authOptions } from './workaround';

export const dynamic = 'force-dynamic';

export function GET(...args) {
  const handler = NextAuth(authOptions);
  return handler(...args);
}

export function POST(...args) {
  const handler = NextAuth(authOptions);
  return handler(...args);
}