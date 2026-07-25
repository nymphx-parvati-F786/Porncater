import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ExoClickSticky from "@/src/components/ui/ads/ExoClickAds/ExoClickSticky";
import ExoClickIM from "@/src/components/ui/ads/ExoClickAds/ExoClickIM";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PornCater | Free High Quality Porn Videos",
  description:
    "Watch the best high-quality porn videos on PornCater. Discover trending pornstars, exclusive categories, and daily updated HD content.",
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
  },
  openGraph: {
    title: "PornCater",
    description: "Watch the best high-quality adult videos on PornCater.",
    url: "https://porncater.com",
    siteName: "PornCater",
    type: "website",
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
        <ExoClickSticky zoneId="5984712" className="z-[9999]" />
        {/* <ExoClickIM zoneId="5984398" className="z-[9999]" /> */}
      </body>
    </html>
  );
}