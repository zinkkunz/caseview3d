/** @type {import('next').NextConfig} */
const nextConfig = {
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
