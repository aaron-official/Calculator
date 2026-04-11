import type { NextConfig } from "next";

const isStatic = process.env.STATIC_BUILD === "true";

const nextConfig: NextConfig = {
  output: isStatic ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Base path is only needed for GitHub Pages subfolder deployment
  basePath: isStatic ? '/Calculator' : '',
  assetPrefix: isStatic ? '/Calculator' : '',
};

export default nextConfig;
