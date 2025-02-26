/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar los errores de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar los errores de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig