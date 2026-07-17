import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 🔥 ZERO-LAG ARCHITECTURE: 
    // We tell Next.js to calculate the exact screen sizes, but let BunnyCDN do all the heavy lifting!
    loader: 'custom',
    loaderFile: './src/utils/bunnyLoader.ts',
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net', // Whitelists all BunnyCDN zones
      },
      {
        protocol: 'https',
        hostname: 'porncater.com', // Your own domain
      },
    ],
    
    // Cache optimized images for 30 days
    minimumCacheTTL: 2592000,
  },
}

export default nextConfig;