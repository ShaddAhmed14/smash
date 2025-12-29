import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      }
    }
    return config
  },
  reactStrictMode: false,
  standalone: true, // Enable standalone build
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  }, // temp solution -- preview module missing types
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },

}

export default nextConfig;