import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@pathos/ui-web', '@pathos/core'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
