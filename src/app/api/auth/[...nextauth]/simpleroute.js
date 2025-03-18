// src/app/api/auth/[...nextauth]/simpleroute.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verificación básica hardcodeada
        if (credentials?.username === "admin" && credentials?.password === "admin123") {
          console.log("Login exitoso para admin");
          return { 
            id: "1", 
            name: "Admin User", 
            email: "admin@example.com",
            role: "admin" 
          };
        }
        console.log("Credenciales inválidas");
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-development-secret"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };