import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // experimental: {
  //   allowedOrigins: ["onezir.iptime.org", "localhost", ".vercel.app"],
  // },
};

export default nextConfig;
