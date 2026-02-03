/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@canneo/ui', '@canneo/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
