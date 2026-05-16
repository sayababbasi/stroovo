import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/login',
        destination: '/auth/login',
      },
      {
        source: '/signup',
        destination: '/auth/signup',
      }
    ];
  },
};

export default nextConfig;

// Trigger hard restart for PrismaClient update
