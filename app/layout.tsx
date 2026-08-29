import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ExoClickIM from "@/src/components/ui/ads/ExoClickAds/ExoClickIM";
import Footer from "@/src/components/layout/Footer";
import JsonLd from "@/src/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/src/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PornCater | Free High Quality Porn Videos",
    template: "%s | PornCater",
  },
  description:
    "Watch the best high-quality porn videos on PornCater. Discover trending pornstars, exclusive categories, and daily updated HD content.",
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
  },
  openGraph: {
    title: "PornCater | Free High Quality Porn Videos",
    description: "Watch the best high-quality adult videos on PornCater.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PornCater | Free High Quality Porn Videos",
    description: "Watch the best high-quality adult videos on PornCater.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
        <meta
          httpEquiv="Delegate-CH"
          content="sec-ch-ua https://s.magsrv.com; sec-ch-ua-mobile https://s.magsrv.com; sec-ch-ua-arch https://s.magsrv.com; sec-ch-ua-model https://s.magsrv.com; sec-ch-ua-platform https://s.magsrv.com; sec-ch-ua-platform-version https://s.magsrv.com; sec-ch-ua-bitness https://s.magsrv.com; sec-ch-ua-full-version-list https://s.magsrv.com; sec-ch-ua-full-version https://s.magsrv.com;"
        />

        <link
          rel="preconnect"
          href="https://img-s1-cdn.porncater.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://a.magsrv.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://s.magsrv.com"
          crossOrigin="anonymous"
        />

        <link rel="dns-prefetch" href="https://z6v2p9a8.bkcdn.net" />
        <link rel="dns-prefetch" href="https://img.doppiocdn.com" />

        <meta
          name="juicyads-verification"
          content="e3101afb907fa706467fa4a2213b3058"
        />
      </head>

      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-300">
        <JsonLd data={siteGraph} />
        {children}

        <ExoClickIM zoneId="5984398" />

        <Footer />
      </body>
    </html>
  );
}
