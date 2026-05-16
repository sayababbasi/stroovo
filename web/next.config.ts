import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
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
