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
  // This is the exact text Google will show under your link
  description: 'Watch the best high-quality porn videos on PornCater. Discover trending pornstars, exclusive categories, and daily updated HD content.',
  openGraph: {
    title: 'PornCater',
    description: 'Watch the best high-quality adult videos on PornCater.',
    url: 'https://porncater.com',
    siteName: 'PornCater', // This helps tell Google your actual brand name
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
