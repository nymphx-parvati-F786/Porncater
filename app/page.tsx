import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import {
  Play, User, Flame, Clock, Sparkles,
  MonitorPlay, Star, ThumbsUp, Filter,
  TrendingUp, Menu, Search, Video, ChevronDown // <-- Added ChevronDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/src/components/ui/SearchBar";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards, blackedLeaderboards } from "@/src/data/adConfig";
import SmartHeader from "@/src/components/ui/SmartHeader";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "PornCater | Free HD Porn Videos & Sexy Porn Scenes",
  description: "Watch the best free HD porn videos, featuring top pornstars and exclusive premium porn tube scenes. Updated daily with fresh, high-quality sex tube scenes.",
  keywords: "free porn, HD porn videos, sex tube, adult cinema, pornstars, XXX movies",
  alternates: { canonical: "https://porncater.com/" },
  openGraph: {
    title: "PornCater | Free HD Porn Videos",
    description: "Stream exclusive HD porn videos and trending porn scenes.",
    url: "https://porncater.com/",
    siteName: "PornCater",
    type: "website",
  },
};

const formatDuration = (seconds: number | string | null | undefined) => {
  if (!seconds) return "10:24";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// 🔥 MOCK NATIVE ADS: Replace these with your actual ExoClick/Sponsor links
const nativeAds = [
  { id: "ad1", title: "Play this Adult Game - No Download Required!", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad2", title: "Meet Horny MILFs in your Exact Area Tonight", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad3", title: "Exclusive Blacked VIP Pass - 70% OFF Today", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-promo-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad4", title: "Try Not To Cum Playing This 3D Sex Game", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-2.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad5", title: "She Wants to Fuck Right Now - Send a Message", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-2.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad6", title: "The Best VR Porn Experience of 2026", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-vr-1.jpg", url: "https://your-affiliate-link.com" },
];

export default async function Home() {
  const [trendingVideos, latestVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      take: 18, // 🔥 Changed to 18 so 18 videos + 6 ads = 24 cards (Perfect 6-column grid)
      orderBy: { views: "desc" },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    }),
    prisma.video.findMany({
      take: 18, // 🔥 Changed to 18
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    }),
    prisma.pornstar.findMany({
      take: 12,
      orderBy: { views: "desc" },
      select: { id: true, slug: true, name: true, avatarUrl: true, views: true },
    }),
  ]);

  const megaCategories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
    "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
    "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
  ];


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PornCater",
    "url": "https://porncater.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://porncater.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="sr-only">Free HD Porn Videos & Premium Adult Cinema - PornCater</h1>

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* =========================================
          💰 TOP WIDE AD BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2">
        <DirectBanner banners={blackedSuperLeaderboards} format="banner-970x70" />
      </div>

      {/* =========================================
          🔥 HOT RIGHT NOW (TRENDING) + NATIVE ADS
          ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-3">
            <Flame className="text-rose-800" size={24} strokeWidth={1.5} />
            <h2 className="text-2xl font-serif italic text-white tracking-wide">
              Trending Porn Videos
            </h2>
          </div>
          <Link href="/trending" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-sm text-xs font-bold uppercase transition border border-zinc-800">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

          {/* 1. Real Videos (18 Items) */}
          {trendingVideos.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} prefetch={false} className="group flex flex-col">
              <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                <Image src={video.thumbnail} alt={video.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                <div className="absolute top-1.5 left-1.5 bg-rose-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                  HD
                </div>
                <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="mt-2 flex flex-col flex-grow">
                <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-75">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-zinc-500 text-[11px] mt-auto pt-1.5 font-medium">
                  <span>{Number(video.views || 0).toLocaleString()} views</span>
                  <span className="flex items-center gap-1 text-emerald-500"><ThumbsUp size={12} /> 98%</span>
                </div>
              </div>
            </Link>
          ))}

          {/* 2. Camouflaged Native Ads (6 Items - Fills the last row perfectly) */}
          {nativeAds.map((ad) => (
            <a key={ad.id} href={ad.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex flex-col cursor-pointer">
              <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md border border-transparent group-hover:border-rose-900/50 transition-colors">
                {/* Fallback img tag for external ad network URLs since they aren't in Next.js domains config */}
                <img src={ad.thumbnail} alt={ad.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all duration-200" />

                {/* Fake Badges to blend in */}
                <div className="absolute top-1.5 left-1.5 bg-zinc-800/90 backdrop-blur-sm text-zinc-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-widest border border-zinc-700">
                  AD
                </div>
                <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                  SPONSORED
                </div>
              </div>
              <div className="mt-2 flex flex-col flex-grow">
                <h3 className="font-light text-zinc-300 text-sm line-clamp-2 leading-relaxed group-hover:text-amber-500 transition-colors duration-75">
                  {ad.title}
                </h3>
                <div className="flex items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest mt-auto pt-1.5 font-medium">
                  <span>Promoted Content</span>
                </div>
              </div>
            </a>
          ))}

        </div>
      </section>

      {/* =========================================
          💰 MID-ROLL AD BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
      </div>

      {/* =========================================
          🕒 FRESH Upload (LATEST) + NATIVE ADS
          ========================================= */}
      <section className="bg-[#0c0c0c] border-y border-zinc-900/50">
        <div className="max-w-[1600px] mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-3">
              <Clock className="text-amber-700" size={24} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-white tracking-wide">
                Latest Porn Videos
              </h2>
            </div>
            <Link href="/latest" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-sm text-xs font-bold uppercase transition border border-zinc-800">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

            {/* 1. Real Videos (18 Items) */}
            {latestVideos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} prefetch={false} className="group flex flex-col">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                  <Image src={video.thumbnail} alt={video.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-amber-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                    NEW
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="mt-2 flex flex-col flex-grow">
                  <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-75">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-zinc-500 text-[11px] mt-auto pt-1.5 font-medium">
                    <span>{Number(video.views || 0).toLocaleString()} views</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> 100%</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* 2. Camouflaged Native Ads (6 Items) */}
            {nativeAds.map((ad) => (
              <a key={`latest-${ad.id}`} href={ad.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex flex-col cursor-pointer">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md border border-transparent group-hover:border-amber-900/50 transition-colors">
                  <img src={ad.thumbnail} alt={ad.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all duration-200" />
                  <div className="absolute top-1.5 left-1.5 bg-zinc-800/90 backdrop-blur-sm text-zinc-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-widest border border-zinc-700">
                    AD
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                    SPONSORED
                  </div>
                </div>
                <div className="mt-2 flex flex-col flex-grow">
                  <h3 className="font-light text-zinc-300 text-sm line-clamp-2 leading-relaxed group-hover:text-amber-500 transition-colors duration-75">
                    {ad.title}
                  </h3>
                  <div className="flex items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest mt-auto pt-1.5 font-medium">
                    <span>Promoted Content</span>
                  </div>
                </div>
              </a>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================
          ⭐ ELEGANT PORNSTARS (SLEEK PILL DESIGN)
          ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
            <h2 className="text-2xl font-serif italic text-white tracking-wide">
              Top Pornstars
            </h2>
          </div>
          <Link href="/pornstars" className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest transition">
            A-Z Index
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {topPornstars.map((star) => (
            <Link key={star.id} href={`/pornstars/${star.slug}`} prefetch={false} className="group flex items-center gap-3 bg-[#111] hover:bg-zinc-900 border border-zinc-800/80 hover:border-rose-900/50 p-1.5 pr-4 transition-all duration-75 shadow-sm">
              <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden shrink-0 border border-zinc-700/50 group-hover:border-rose-500/50 transition-colors duration-300">
                <Image src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} fill sizes="48px" className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-zinc-200 font-bold text-sm truncate group-hover:text-rose-400 transition-colors">
                  {star.name}
                </span>
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mt-0.5">
                  {Number(star.views || 0).toLocaleString()} Views
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================
          💰 BOTTOM SQUARE/NATIVE AD
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 py-8 flex justify-center">
        <div className="flex justify-center items-center w-full">
          <iframe style={{ backgroundColor: "transparent" }} width="315" height="300" scrolling="no" frameBorder="0" {...({ allowtransparency: "true" } as any)} name="spot_id_10002484" src="//a.adtng.com/get/10002484?ata=deviparvatilovemuslimcocks" title="Advertisement" loading="lazy" />
        </div>
      </div>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505]">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography. By entering this site you swear that you are of legal age in your area to view adult material and that you wish to view such material.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}