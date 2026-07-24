import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🔥 Import your Floating Ad Components
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
  title: 'PornCater | Free High Quality Porn Videos',
  description: 'Watch the best high-quality porn videos on PornCater. Discover trending pornstars, exclusive categories, and daily updated HD content.',
  // 🔥 THE RTA TAG: Tells crawlers and affiliate reviewers this is a verified 18+ site
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
  },
  openGraph: {
    title: 'PornCater',
    description: 'Watch the best high-quality adult videos on PornCater.',
    url: 'https://porncater.com',
    siteName: 'PornCater',
    type: 'website',
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
        {/* 🔥 EXOCLICK CLIENT HINTS: Boosts ad relevance and CPM/CPT payouts */}
        <meta 
          httpEquiv="Delegate-CH" 
          content="sec-ch-ua https://s.magsrv.com; sec-ch-ua-mobile https://s.magsrv.com; sec-ch-ua-arch https://s.magsrv.com; sec-ch-ua-model https://s.magsrv.com; sec-ch-ua-platform https://s.magsrv.com; sec-ch-ua-platform-version https://s.magsrv.com; sec-ch-ua-bitness https://s.magsrv.com; sec-ch-ua-full-version-list https://s.magsrv.com; sec-ch-ua-full-version https://s.magsrv.com;" 
        />
        {/* 🔥 INSTANT DNS HANDSHAKE */}
        <link rel="preconnect" href="https://www.porncater-pz.b-cdn.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.porncater-pz.b-cdn.net" />
        {/* JuicyAds Website Verification Meta Tag */}
        <meta
          name="juicyads-verification"
          content="e3101afb907fa706467fa4a2213b3058"
        />
      </head>
      
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-300">
        
        {/* 1. Main Content Renders First */}
        {children}

        {/* 
          2. GLOBAL FLOATING ADS (Render Last)
          z-[9999] ensures they sit on top of everything (headers, footers, video players).
          Because they are in layout.tsx, they follow the user seamlessly from page to page!
        */}
        <ExoClickSticky zoneId="5984712" className="z-[9999]" />
        
        {/* Keep the chat bubble here if you want it popping up! Just set frequency capping in ExoClick */}
        <ExoClickIM zoneId="5984398" className="z-[9999]" />
        
      </body>
    </html>
  );
}