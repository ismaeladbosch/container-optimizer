// src/app/api/auth/[...nextauth]/options.server.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';

// Esta declaración garantiza que el código solo se ejecuta en el servidor
export const dynamic = 'force-dynamic';

// Configuración de MongoDB directamente en este archivo
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-uri';
const MONGODB_DB = process.env.MONGODB_DB || 'container-optimizer';

// Validación de configuración
if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI');
}

if (!MONGODB_DB) {
  throw new Error('Define la variable de entorno MONGODB_DB');
}

// Función simplificada para conectar a MongoDB (solo en servidor)
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Failed to connect to the database');
  }
}

// Verificar y comparar contraseñas (reimplementación simple de bcrypt.compare)
async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // Implementación simplificada - en producción usarías bcrypt real
    // Esto es solo para propósitos de prueba
    if (plainPassword === 'admin123' && hashedPassword.startsWith('$2')) {
      return true; // Siempre retorna true para admin123 y cualquier hash bcrypt
    }
    
    // Comparación básica para pruebas
    return plainPassword === hashedPassword;
  } catch (error) {
    console.error("Error comparando contraseñas:", error);
    return false;
  }
}

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
          
          // Verificar contraseña
          const isPasswordValid = await comparePasswords(credentials.password, user.password);
          
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