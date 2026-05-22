/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/math-young-lecturer',
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
