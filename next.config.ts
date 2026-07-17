import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 🔥 THE FIX: This stops Next.js from bottlenecking your server.
    // It bypasses the Next.js Image Optimization API and pulls directly from BunnyCDN!
    unoptimized: true, 

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net', // Whitelists all BunnyCDN zones
      },
      {
        protocol: 'https',
        hostname: 'porncater.com', // Your own domain
      },
      // If you ever set up a custom CNAME like cdn.porncater.com, add it here:
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.porncater.com',
      // }
    ],
    
    // Cache optimized images for 30 days (still good to have for caching headers)
    minimumCacheTTL: 2592000,
  },
}

export default nextConfig;