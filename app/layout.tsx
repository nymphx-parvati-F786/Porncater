import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        {/* JuicyAds Website Verification Meta Tag */}
        <meta
          name="juicyads-verification"
          content="e3101afb907fa706467fa4a2213b3058"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}