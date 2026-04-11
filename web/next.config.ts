import type { NextConfig } from "next";

const isStatic = process.env.STATIC_BUILD === "true";

const nextConfig: NextConfig = {
  output: isStatic ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Ensure the project name matches your repository name exactly
  basePath: isStatic ? '/Calculator' : '',
  // Asset prefix is crucial for CSS/JS loading on subpaths
  assetPrefix: isStatic ? '/Calculator/' : '',
};

export default nextConfig;
