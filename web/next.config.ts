import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const backendUrl = rawUrl.replace(/\/api\/?$/, '');
    
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
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
