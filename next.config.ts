import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 🔥 Remove the custom loader. We are using Next.js default optimization now.
    remotePatterns: [
      { protocol: 'https', hostname: '**.b-cdn.net' },
      { protocol: 'https', hostname: 'img-s1-cdn.porncater.com' },
      { protocol: 'https', hostname: '**.bkcdn.net' },
      { protocol: 'https', hostname: 'porncater.com' },
    ],
    formats: ['image/webp'], // Force WebP generation
    minimumCacheTTL: 2592000, // 🔥 CRITICAL: Cache optimized images for 30 days so Vercel doesn't overcharge you
    dangerouslyAllowSVG: true,
  },
}

export default nextConfig;