import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure the project name matches your repository name
  basePath: '/Calculator',
  assetPrefix: '/Calculator',
};

export default nextConfig;
