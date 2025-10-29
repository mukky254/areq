/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Add this to handle static generation
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
