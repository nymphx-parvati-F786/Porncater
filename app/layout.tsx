import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ExoClickSticky from "@/src/components/ui/ads/ExoClickAds/ExoClickSticky";
import ExoClickIM from "@/src/components/ui/ads/ExoClickAds/ExoClickIM";
import Footer from "@/src/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔥 NEW: Explicit viewport export for Next.js 14/15
export const viewport: Viewport = {
  themeColor: "#050505", // Turns the mobile Safari/Chrome address bar pitch black
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// 🔥 UPGRADED ROOT METADATA
export const metadata: Metadata = {
  metadataBase: new URL("https://porncater.com"), // CRITICAL: Resolves all relative URLs for SEO
  title: {
    default: "PornCater | Free High Quality Porn Videos",
    template: "%s | PornCater", // Automatically appends your brand to child page titles
  },
  description:
    "Watch the best high-quality porn videos on PornCater. Discover trending pornstars, exclusive categories, and daily updated HD content.",
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
  },
  openGraph: {
    title: "PornCater | Free High Quality Porn Videos",
    description: "Watch the best high-quality adult videos on PornCater.",
    url: "https://porncater.com",
    siteName: "PornCater",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PornCater | Free High Quality Porn Videos",
    description: "Watch the best high-quality adult videos on PornCater.",
  },
  // 🔥 THE GOOGLE VIDEO PREVIEW HACK
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1, // Tells Google to show full animated video previews in search results
      "max-image-preview": "large", // Forces Google to show large hero images
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 🔥 EXOCLICK CLIENT HINTS: Boosts ad relevance and CPM payouts */}
        <meta
          httpEquiv="Delegate-CH"
          content="sec-ch-ua https://s.magsrv.com; sec-ch-ua-mobile https://s.magsrv.com; sec-ch-ua-arch https://s.magsrv.com; sec-ch-ua-model https://s.magsrv.com; sec-ch-ua-platform https://s.magsrv.com; sec-ch-ua-platform-version https://s.magsrv.com; sec-ch-ua-bitness https://s.magsrv.com; sec-ch-ua-full-version-list https://s.magsrv.com; sec-ch-ua-full-version https://s.magsrv.com;"
        />

        {/* 🔥 INSTANT NETWORK HANDSHAKES: Reduces connection latency for Ads & CDN */}
        <link rel="preconnect" href="https://img-s1-cdn.porncater.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://a.magsrv.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://s.magsrv.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://z6v2p9a8.bkcdn.net" crossOrigin="anonymous" />
        
        <link rel="dns-prefetch" href="https://img-s1-cdn.porncater.com" />
        <link rel="dns-prefetch" href="https://a.magsrv.com" />
        <link rel="dns-prefetch" href="https://s.magsrv.com" />
        <link rel="dns-prefetch" href="https://z6v2p9a8.bkcdn.net" />

        {/* JuicyAds Verification Tag */}
        <meta
          name="juicyads-verification"
          content="e3101afb907fa706467fa4a2213b3058"
        />
      </head>

      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-300">
        {/* 1. Main Page Content */}
        {children}

        {/* 2. Global Floating & Sticky Ads */}
        {/* <ExoClickSticky zoneId="5984712" className="z-[9999]" /> */}
        <ExoClickIM zoneId="5984398" className="z-[9999]" />
        <Footer />
      </body>
    </html>
  );
}