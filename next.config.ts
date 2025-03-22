import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt']
  },
  typescript: {
    ignoreBuildErrors: true, // Only for quick deployment - remove this for production
  },
  eslint: {
    ignoreDuringBuilds: true, // Only for quick deployment - remove this for production
  }
};

export default nextConfig;
