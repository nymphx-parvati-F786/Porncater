import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import {
  Search as SearchIcon, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Clock, Sparkles, MonitorPlay,
  Star, Filter, TrendingUp, Menu, Video, Flame
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import SearchBar from "@/src/components/ui/SearchBar";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards, blackedLeaderboards } from "@/src/data/adConfig";

export const revalidate = 60; // Cache search responses for 60s at the edge

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const formatDuration = (seconds: number | string | null | undefined) => {
  if (!seconds) return "10:24";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// 🔥 Camouflaged Native Ads for Grid Symmetry
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

// =========================================================
// 🚀 SEARCH SEO ENGINE: DYNAMIC METADATA
// =========================================================
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
  const page = resolvedParams.page ? String(resolvedParams.page) : "1";
  
  if (!q) {
    return { title: "Search Free HD Porn Videos | PornCater" };
  }

  const canonicalUrl = `https://porncater.com/search?q=${encodeURIComponent(q)}&page=${page}`;

  return {
    title: `"${q}" Porn Videos - Free ${q} XXX Sex Clips Page ${page} | PornCater`,
    description: `Watch free ${q} porn videos and HD sex scenes. Streaming the best adult clips matching "${q}" updated daily on PornCater.`,
    keywords: `${q} porn, ${q} sex videos, watch ${q} adult tube, free ${q} clips, HD XXX`,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// =========================================================
// 🎬 PRIMARY SEARCH COMPONENT
// =========================================================
export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";

  if (!q) {
    redirect("/");
  }

  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);
  const currentSort = (resolvedParams.sort as string) || "most-viewed";
  const videosPerPage = 24;
  const skipAmount = (currentPage - 1) * videosPerPage;

  // Prisma Order Selection
  let prismaOrderBy: Prisma.VideoOrderByWithRelationInput = { views: "desc" };
  if (currentSort === "newest") {
    prismaOrderBy = { createdAt: "desc" };
  } else if (currentSort === "top-rated") {
    prismaOrderBy = { likes: "desc" };
  }

  // Multi-column search clause across title, category, and tags
  const normalizedTag = q.toLowerCase();
  const whereClause: Prisma.VideoWhereInput = {
    status: "PUBLISHED",
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { tags: { has: normalizedTag } }
    ],
  };

  // =========================================================================
  // 🚀 DEFERRED JOIN SEARCH QUERY ARCHITECTURE
  // =========================================================================
  
  // Step A: Index-Only Scan to get matching IDs
  const videoIds = await prisma.video.findMany({
    where: whereClause,
    select: { id: true },
    orderBy: prismaOrderBy,
    skip: skipAmount,
    take: videosPerPage,
  });

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full row details for target IDs
  let videos: any[] = [];
  if (ids.length > 0) {
    const unorderedVideos = await prisma.video.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        duration: true,
        views: true,
        likes: true,
      },
    });
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Step C: Count total search matches for pagination calculation
  const totalCount = await prisma.video.count({ where: whereClause });

  const hardPageLimit = 100;
  const calculatedPages = Math.ceil(totalCount / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  // =========================================================================

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const buildPageUrl = (page: number | string) => 
    `/search?q=${encodeURIComponent(q)}&page=${page}&sort=${currentSort}`;

  // Structured Data Schema for Search Results
  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Porn Search Results for "${q}" - PornCater`,
    "url": `https://porncater.com/search?q=${encodeURIComponent(q)}`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Search", "item": "https://porncater.com/search" },
      { "@type": "ListItem", "position": 3, "name": q, "item": `https://porncater.com/search?q=${encodeURIComponent(q)}` }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* Inject SEO Schema Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([searchSchema, breadcrumbSchema]) }}
      />

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
            <Link href="/latest" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
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
          🔥 SEARCH HEADER & DYNAMIC FILTERS
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">

          <div className="flex items-center gap-3">
            <SearchIcon className="text-rose-700" size={32} strokeWidth={2} />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500">Search Query:</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide truncate max-w-xl">
                "{q}"
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} Matching Videos
              </p>
            </div>
          </div>

          {/* 🔥 FUNCTIONAL SORT BAR FOR SEARCH */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white">
              <SlidersHorizontal size={14} className="text-zinc-400" /> Sort
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=most-viewed`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentSort === "most-viewed"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Most Viewed
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=newest`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentSort === "newest"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Newest
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=top-rated`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentSort === "top-rated"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Top Rated
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          🎥 THE 24-CARD VIDEO GRID
          ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

            {/* 1. Real Matched Videos */}
            {videos.map((video, index) => (
              <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} prefetch={false} className="group flex flex-col">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    priority={index < 6}
                    className="object-cover transition-transform duration-75 ease-out group-hover:scale-[1.01]"
                  />
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
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><ThumbsUp size={12} /> 98%</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* 2. Camouflaged Native Ads */}
            {nativeAds.map((ad) => (
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
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center border border-zinc-800/80 rounded-sm bg-[#111]">
            <Flame size={48} className="text-rose-800 mb-4 animate-bounce" />
            <h3 className="text-2xl font-serif italic text-white mb-2">No videos matched "{q}"</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1 max-w-md mx-auto leading-relaxed">
              Try searching with broader terms, single keywords, or browse popular niches below.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl px-4">
              {megaCategories.slice(0, 10).map((cat, i) => (
                <Link
                  key={i}
                  href={`/category/${cat.toLowerCase()}`}
                  className="bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-white px-3 py-1.5 text-xs uppercase font-bold tracking-wider rounded-sm transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGINATION CONTROLS                                       */}
        {/* ========================================================= */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 flex items-center justify-center gap-2">

            {/* Previous Page Button */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:bg-rose-900/20 hover:text-white transition-all rounded-sm mr-2"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-zinc-900/20 border border-zinc-900 text-zinc-700 rounded-sm mr-2 cursor-not-allowed">
                <ChevronLeft size={16} />
              </div>
            )}

            {/* Page Number Sequence */}
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
                  href={buildPageUrl(pageNum)}
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
                href={buildPageUrl(currentPage + 1)}
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
          💰 BOTTOM-ROLL AD BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
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