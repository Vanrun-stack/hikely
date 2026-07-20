import type { NextConfig } from 'next';

const isDocker = process.env.DOCKER === '1';

const nextConfig: NextConfig = {
  // Standalone output only inside Docker (Linux)
  // Windows can't create symlinks without admin privileges
  ...(isDocker ? { output: 'standalone' } : {}),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Optimize MapLibre bundle — it's heavy
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'maplibre-gl': 'maplibre-gl',
    };
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For GPX file uploads
    },
  },

  // Disable source maps in production for smaller images
  productionBrowserSourceMaps: false,

  // Remove powered-by header
  poweredByHeader: false,
};

export default nextConfig;
