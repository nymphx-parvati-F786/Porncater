import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import {
  Clock, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Flame, Sparkles, MonitorPlay,
  Star, Filter, TrendingUp, Menu, Search, Video, PlayCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/src/components/ui/SearchBar";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards, blackedLeaderboards } from "@/src/data/adConfig";

export const revalidate = 120; // Caches the page for 2 minutes

export const metadata: Metadata = {
  title: "Latest Free HD Porn Videos | PornCater",
  description: "Browse the newest and freshest HD porn videos updated daily. Watch exclusive premium adult cinema and sex tube scenes on PornCater.",
  keywords: "new porn, latest sex videos, free HD porn, fresh porn tube, adult cinema",
  alternates: { canonical: "https://porncater.com/latest" },
};

const formatDuration = (seconds: number | string | null | undefined) => {
  if (!seconds) return "10:24";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// 🔥 MOCK NATIVE ADS: Camouflaged perfectly for the grid
const nativeAds = [
  { id: "ad1", title: "Play this Adult Game - No Download Required!", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad2", title: "Meet Horny MILFs in your Exact Area Tonight", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad3", title: "Exclusive Blacked VIP Pass - 70% OFF Today", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-promo-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad4", title: "Try Not To Cum Playing This 3D Sex Game", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-2.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad5", title: "She Wants to Fuck Right Now - Send a Message", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-2.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad6", title: "The Best VR Porn Experience of 2026", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-vr-1.jpg", url: "https://your-affiliate-link.com" },
];

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;

  // 🔥 EXTRACT SORT PARAMETER & DEFINE PRISMA ORDER
  const currentSort = resolvedParams.sort === "most-viewed" ? "most-viewed" : "newest";
  const prismaOrderBy = currentSort === "most-viewed" ? { views: "desc" as const } : { createdAt: "desc" as const };

  const videosPerPage = 36;
  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);

  const [videos, totalCount] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: prismaOrderBy, // 🚀 DYNAMIC SORT INJECTED HERE!
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    }),
    prisma.video.count({
      where: { status: "PUBLISHED" },
    })
  ]);

  const totalPages = Math.ceil(totalCount / videosPerPage);

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">

      {/* =========================================
          🔥 SEXY FROSTED GLASS MEGA-HEADER
          ========================================= */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/90 flex flex-col transition-all">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden text-zinc-400 hover:text-white transition">
              <Menu size={28} />
            </button>
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="md:hidden text-zinc-400 hover:text-white transition">
              <Search size={24} />
            </button>
            <Link href="/admin/upload" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 backdrop-blur-sm">
              <Video size={16} /> Upload
            </Link>
            <Link href="/login" className="bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(190,18,60,0.4)]">
              Sign In
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <MonitorPlay size={18} /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <TrendingUp size={18} /> Trending
            </Link>
            <Link href="/latest" className="flex items-center gap-2 text-rose-500 border-b-2 border-rose-600 py-3 text-sm font-bold uppercase tracking-wide drop-shadow-md">
              <Clock size={18} /> New Videos
            </Link>
            <Link href="/top-rated" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Star size={18} /> Top Rated
            </Link>
            <Link href="/pornstars" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Sparkles size={18} /> Pornstars
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/20">
          <div className="max-w-[1600px] mx-auto px-2 lg:px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 text-zinc-400 mr-2 shrink-0 px-2">
              <Filter size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Niches</span>
            </div>
            {megaCategories.map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.toLowerCase()}`}
                prefetch={false}
                className="whitespace-nowrap bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm shrink-0 backdrop-blur-md"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* =========================================
          💰 TOP WIDE AD BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2">
        <DirectBanner banners={blackedSuperLeaderboards} format="banner-970x70" />
      </div>

      {/* =========================================
          🔥 DIRECTORY HEADER & DYNAMIC FILTERS
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">

          <div className="flex items-center gap-3">
            <Clock className="text-rose-700" size={28} strokeWidth={2} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide flex items-center gap-2">
                {currentSort === "most-viewed" ? "Most Viewed Videos" : "Fresh Uploads"}
                {currentSort === "newest" && <span className="bg-rose-700 text-white font-sans text-[10px] px-2 py-0.5 rounded-sm tracking-widest not-italic hidden sm:block">NEW</span>}
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} Videos
              </p>
            </div>
          </div>

          {/* 🔥 REAL FUNCTIONAL SORT BAR */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white">
              <SlidersHorizontal size={14} className="text-zinc-400" /> Sort
            </div>

            <Link
              href="/latest?sort=newest"
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "newest"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Newest
            </Link>

            <Link
              href="/latest?sort=most-viewed"
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "most-viewed"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Most Viewed
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          🎥 THE 24-CARD VIDEO GRID
          ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

          {/* 1. Real Videos */}
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} prefetch={false} className="group flex flex-col">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    priority={index < 6}
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-amber-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                    {currentSort === "most-viewed" ? "HOT" : "NEW"}
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
                    <span className="flex items-center gap-1 text-emerald-500"><ThumbsUp size={12} /> 100%</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32">
              <Clock className="text-zinc-700 w-16 h-16 mb-4" />
              <p className="text-zinc-500 text-lg font-light tracking-wide uppercase">No videos found on this page.</p>
            </div>
          )}

          {/* 2. Camouflaged Native Ads (Fills the exact 4th Row!) */}
          {videos.length > 0 && nativeAds.map((ad) => (
            <a key={ad.id} href={ad.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex flex-col cursor-pointer">
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
        {/* ========================================================= */}
        {/* PAGINATION CONTROLS                                       */}
        {/* ========================================================= */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 flex items-center justify-center gap-2">
            
            {/* Previous Page Button */}
            {currentPage > 1 ? (
              <Link
                href={`/trending?page=${currentPage - 1}`}
                className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:bg-rose-900/20 hover:text-white transition-all rounded-sm mr-2"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-zinc-900/20 border border-zinc-900 text-zinc-700 rounded-sm mr-2 cursor-not-allowed">
                <ChevronLeft size={16} />
              </div>
            )}

            {/* The Page Numbers */}
            {generatePagination().map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-zinc-600">
                    ...
                  </span>
                );
              }

              return (
                <Link
                  key={pageNum}
                  href={`/trending?page=${pageNum}`}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-mono transition-all rounded-sm border ${
                    currentPage === pageNum
                      ? "border-rose-800 bg-rose-900/20 text-white shadow-[0_0_10px_rgba(190,18,60,0.2)]"
                      : "border-zinc-900/50 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {/* Next Page Button */}
            {currentPage < totalPages ? (
              <Link
                href={`/trending?page=${currentPage + 1}`}
                className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:bg-rose-900/20 hover:text-white transition-all rounded-sm ml-2"
              >
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-zinc-900/20 border border-zinc-900 text-zinc-700 rounded-sm ml-2 cursor-not-allowed">
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================
          💰 BOTTOM-ROLL AD BANNER (The "Click Trap")
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
      </div>

      

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505] w-full mt-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-2xl font-black tracking-tighter mb-4 flex items-center justify-center gap-1">
          <span className="text-rose-800 drop-shadow-sm">Porn</span>
          <span className="text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}