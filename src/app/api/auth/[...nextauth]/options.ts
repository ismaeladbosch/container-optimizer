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
        console.log("Intentando autorizar usuario:", credentials?.username);
        
        // ★★★ LOGIN DE EMERGENCIA ★★★
        // Esto permitirá entrar con admin/admin123 sin verificar en la base de datos
        if (credentials?.username === "admin" && credentials?.password === "admin123") {
          console.log("⭐ LOGIN DE EMERGENCIA ACTIVADO ⭐");
          return {
            id: "emergency-admin-id",
            name: "admin",
            role: "admin"
          };
        }
        
        if (!credentials?.username || !credentials?.password) {
          console.log("Credenciales incompletas rechazadas");
          return null;
        }
        
        try {
          console.log("Conectando a la base de datos...");
          const { db } = await connectToDatabase();
          console.log("Conexión a DB exitosa, buscando usuario:", credentials.username);
          
          // Buscar usuario
          const user = await db.collection('users').findOne({ 
            username: credentials.username 
          });
          
          if (!user) {
            console.log(`Usuario no encontrado: ${credentials.username}`);
            return null;
          }
          
          console.log(`Usuario encontrado: ${user.username}, verificando contraseña...`);
          console.log(`Hash almacenado (primeros 10 caracteres): ${user.password.substring(0, 10)}...`);
          
          // Verificar contraseña
          const isPasswordValid = await compare(credentials.password, user.password);
          
          console.log(`Resultado de verificación de contraseña: ${isPasswordValid}`);
          
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
          console.log("Detalles del error:", error instanceof Error ? error.message : String(error));
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Añadir role al token si existe en el usuario
      if (user) {
        console.log("Añadiendo información al token JWT:", {
          role: user.role,
          id: user.id
        });
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Añadir información de usuario a la sesión
      if (session.user) {
        console.log("Añadiendo información a la sesión:", {
          role: token.role,
          id: token.id
        });
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // Habilitar modo debug para ver más información en los logs
};

export default authOptions;