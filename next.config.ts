/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Enable TypeScript
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint configuration
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig