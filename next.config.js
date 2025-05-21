/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'eventnexus.in',
        port: '3000',
        pathname: '/api/uploads/**',
      }
    ]
  },
};

module.exports = nextConfig;