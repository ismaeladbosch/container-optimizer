// src/app/api/auth/[...nextauth]/options.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const { db } = await connectToDatabase();
          
          // Buscar usuario
          const user = await db.collection('users').findOne({ 
            username: credentials.username 
          });
          
          if (!user) {
            console.log(`Usuario no encontrado: ${credentials.username}`);
            return null;
          }
          
          // Verificar contraseña
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.log(`Contraseña inválida para usuario: ${credentials.username}`);
            return null;
          }
          
          // Usuario autenticado
          console.log(`Usuario autenticado: ${credentials.username}, role: ${user.role}`);
          return {
            id: user._id.toString(),
            name: user.username,
            role: user.role
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Añadir role al token si existe en el usuario
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Añadir información de usuario a la sesión
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default authOptions;