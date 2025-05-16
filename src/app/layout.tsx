import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Optimizador de Contenedores',
  description: 'Herramienta para optimizar el almacenamiento en contenedores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
