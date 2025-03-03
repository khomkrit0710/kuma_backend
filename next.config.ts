import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Dangerous: Ignores TS errors when building
    ignoreBuildErrors: true,
  },
};

export default nextConfig;