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
  // 🔥 THE SEO SAVIOR: Permanently redirects old routes to new ones
  async redirects() {
    return [
      {
        source: '/watch/:id/:slug*',
        destination: '/video/:id/:slug*',
        permanent: true, // 301 Permanent Redirect
      },
      {
        source: '/videos/latest',
        destination: '/latest',
        permanent: true,
      },
    ];
  },
}

export default nextConfig;