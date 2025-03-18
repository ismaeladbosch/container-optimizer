/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // No incluir módulos de servidor en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'fs/promises': false,
        path: false,
        stream: false,
        crypto: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        util: false,
        os: false,
        assert: false
      };
    }
    return config;
  }
};

module.exports = nextConfig;