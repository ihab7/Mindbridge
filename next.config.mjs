/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
