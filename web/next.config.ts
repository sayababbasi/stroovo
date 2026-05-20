import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const backendUrl = rawUrl.replace(/\/api\/?$/, '');
    
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: '/api/tasks',
        destination: `${backendUrl}/api/tasks`,
      },
      {
        source: '/api/tasks/:id',
        destination: `${backendUrl}/api/tasks/:id`,
      },
      {
        source: '/api/teams',
        destination: `${backendUrl}/api/teams`,
      },
      {
        source: '/api/teams/:id',
        destination: `${backendUrl}/api/teams/:id`,
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
