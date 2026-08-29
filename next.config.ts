import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Thumbs are already Sharp-compressed at upload. Remote Next/Bunny image
    // optimization previously blew the budget.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.b-cdn.net" },
      { protocol: "https", hostname: "img-s1-cdn.porncater.com" },
      { protocol: "https", hostname: "**.bkcdn.net" },
      { protocol: "https", hostname: "porncater.com" },
      { protocol: "https", hostname: "www.porncater.com" },
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 2592000,
    dangerouslyAllowSVG: false,
  },
  async redirects() {
    return [
      {
        source: "/watch/:id/:slug*",
        destination: "/video/:id/:slug*",
        permanent: true,
      },
      {
        source: "/videos/latest",
        destination: "/latest",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/((?!embed/).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
