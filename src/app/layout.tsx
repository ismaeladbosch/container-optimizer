// src/app/layout.tsx
'use client';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import NavBar from '@/components/NavBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <NavBar />
          <main className="pt-16">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}