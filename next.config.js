/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Disable server-side rendering for specific pages if needed
  // This ensures they only run on client side
  images: {
    domains: ['backita.onrender.com'],
  },
}

module.exports = nextConfig
