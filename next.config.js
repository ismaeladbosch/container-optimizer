/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto desactiva las verificaciones de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Esto permite que el build continúe a pesar de errores de TypeScript
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;