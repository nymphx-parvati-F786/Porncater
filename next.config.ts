import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net', // Whitelists all BunnyCDN zones
      },
      {
        protocol: 'https',
        hostname: 'porncater.com', // Your own domain
      },
      // 🔥 Add your custom pull zone domain here if you use one instead of the default bunnycdn url
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.porncater.com',
      // }
    ],
    // Cache optimized images for 30 days to save compute costs
    minimumCacheTTL: 2592000,
  },
}

export default nextConfig