// src/app/api/auth/[...nextauth]/workaround.js
// Este archivo es un reemplazo temporal para la autenticación mientras solucionamos los problemas de MongoDB

export const authOptions = {
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {},
      async authorize(credentials) {
        // Verificación de admin/admin123 hardcodeada
        if (credentials.username === "admin" && credentials.password === "admin123") {
          return { id: "admin-id", name: "admin", role: "admin" };
        }
        return null;
      }
    }
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
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
    maxAge: 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development"
};