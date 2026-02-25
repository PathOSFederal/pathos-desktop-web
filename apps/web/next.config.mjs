/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pathos/ui-web", "@pathos/core"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
