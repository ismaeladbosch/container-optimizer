import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Verificar si se proporcionaron credenciales
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Conectar a la base de datos
          const { db } = await connectToDatabase();
          
          // Buscar usuario
          const user = await db.collection('users').findOne({ 
            username: credentials.username 
          });

          if (!user) {
            return null;
          }

          // Verificar contraseña
          const isValid = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Devolver usuario si las credenciales son válidas
          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role
          };
        } catch (error) {
          console.error('Error de autenticación:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || '$2b$12$lVoa//H5vyI7xNqjfujBJOUVpJbN.uRK0tNSSo0/L6dbmIpVaoQq6'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };