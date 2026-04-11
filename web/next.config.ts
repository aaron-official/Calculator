import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages usually hosts on /repo-name/, but for now we'll assume root or custom domain.
  // If you use username.github.io/Calculator, you might need basePath: '/Calculator'
};

export default nextConfig;
