import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ['@doxie/db'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      }
    ]
  }
};

export default nextConfig;
