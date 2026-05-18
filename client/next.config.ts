import type { NextConfig } from 'next'

const strapiHost = process.env.STRAPI_BASE_URL
  ? new URL(process.env.STRAPI_BASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: true,
    }),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3040',
        pathname: '/uploads/**',
      },
      // Live Strapi server hostname (from STRAPI_BASE_URL env)
      ...(strapiHost ? [{
        protocol: 'https' as const,
        hostname: strapiHost,
        pathname: '/uploads/**',
      }] : []),
      {
        protocol: 'https',
        hostname: '*.strapi.io',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.strapiapp.com',
      },
    ],
  },
}

export default nextConfig
