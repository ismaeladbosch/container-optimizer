/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Añade esta sección para evitar redirecciones para endpoints específicos
  async redirects() {
    return [];
  }
};

module.exports = nextConfig;