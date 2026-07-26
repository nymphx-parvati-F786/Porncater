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
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";

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

// 🔥 SERVER-SIDE AD FETCHING HELPER FOR 0ms LCP
async function getTopBannerAd(dimension: string) {
  try {
    const banner = await prisma.banner.findFirst({
      where: { dimension: dimension, isActive: true },
      orderBy: { weight: "desc" },
      select: { imageUrl: true, trackingLink: true },
    });

    if (!banner) return null;

    let imageUrl = banner.imageUrl;
    if (imageUrl.startsWith("//")) {
      imageUrl = "https:" + imageUrl;
    }

    return { imageUrl, trackingLink: banner.trackingLink };
  } catch (error) {
    return null;
  }
}

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

  // 1. EXTRACT SORT PARAMETER & DEFINE PRISMA ORDER
  const currentSort = resolvedParams.sort === "most-viewed" ? "most-viewed" : "newest";
  const prismaOrderBy = currentSort === "most-viewed" ? { views: "desc" as const } : { createdAt: "desc" as const };

  const videosPerPage = 36;
  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);
  const skipAmount = (currentPage - 1) * videosPerPage;

  // =========================================================================
  // 🚀 HIGH-PERFORMANCE DATA FETCHING ARCHITECTURE (DEFERRED JOIN)
  // =========================================================================

  // Step A: Fast Index-Only scan to get JUST the IDs
  const videoIds = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
    orderBy: prismaOrderBy,
    skip: skipAmount,
    take: videosPerPage,
  });

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full data only for those specific IDs
  let videos: any[] = [];
  if (ids.length > 0) {
    const unorderedVideos = await prisma.video.findMany({
      where: { id: { in: ids } },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    });
    // Map them back into the exact sorted order retrieved from Step A
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Step C: Concurrent requests for count and Top Ads
  const [tableStats, topDesktopAd, topMobileAd] = await Promise.all([
    prisma.$queryRaw<{ estimate: number }[]>`SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'Video';`,
    getTopBannerAd("970x70"),
    getTopBannerAd("300x250") // Standardized mobile size
  ]);

  // Parse estimate safely (raw queries can return BigInts)
  const estimatedTotal = Number(tableStats[0]?.estimate || 0);

  // Step D: SEO Hard Cap - Never let bots crawl past page 200 (prevents spider traps)
  const hardPageLimit = 200;
  const calculatedPages = Math.ceil(estimatedTotal / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  // =========================================================================

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const buildPageUrl = (page: number | string) => `/latest?page=${page}&sort=${currentSort}`;
  const canonicalUrl = `https://porncater.com/latest${currentPage !== 1 ? `?page=${currentPage}` : ""}`;

  // =========================================================
  // 🚀 SUPER JSON-LD SCHEMA INJECTION
  // =========================================================

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Latest Videos", "item": canonicalUrl }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest Free HD Porn Videos",
    "url": canonicalUrl,
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://porncater.com/video/${video.id}/${video.slug}`,
      "name": video.title,
      "image": video.thumbnail
    }))
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* Inject SEO Schema Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, itemListSchema]) }}
      />

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* =========================================
          💰 TOP DYNAMIC AFFILIATE BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2 flex justify-center">
        {/* Desktop View: Wide Super Leaderboard (970x70) */}
        <AdBanner
          dimension="970x70"
          priority={true}
          initialAd={topDesktopAd}
          className="hidden md:block w-full max-w-[970px]"
        />
        {/* Mobile View: High-Converting Box Banner (300x250) */}
        <AdBanner
          dimension="300x100"
          priority={true}
          initialAd={topMobileAd}
          className="block md:hidden mx-auto"
        />
      </div>

      {/* =========================================
          🔥 DIRECTORY HEADER & DYNAMIC FILTERS
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">

          <div className="flex items-center gap-3">
            <Clock className="text-rose-600" size={28} strokeWidth={2} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide flex items-center gap-2">
                {currentSort === "most-viewed" ? "Most Viewed Videos" : "Fresh Uploads"}
                {currentSort === "newest" && <span className="bg-rose-700 text-white font-sans text-[10px] px-2 py-0.5 rounded-sm tracking-widest not-italic hidden sm:block">NEW</span>}
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {estimatedTotal.toLocaleString()}+ Videos
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

          {/* Real Videos */}
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <Link key={video.id} href={`/video/${video.id}/${video.slug}`} prefetch={false} className="group flex flex-col">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    priority={index < 6}
                    className="object-cover transition-transform duration-75 ease-out group-hover:scale-[1.01]"
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
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><ThumbsUp size={12} /> 100%</span>
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

        </div>

        {/* ========================================================= */}
        {/* PAGINATION CONTROLS                                       */}
        {/* ========================================================= */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 flex items-center justify-center gap-2">

            {/* Previous Page Button */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-600/50 hover:bg-rose-900/20 hover:text-white transition-all rounded-sm mr-2"
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
                  href={buildPageUrl(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-mono transition-all rounded-sm border ${currentPage === pageNum
                    ? "border-rose-600 bg-rose-900/20 text-white shadow-[0_0_10px_rgba(225,29,72,0.2)]"
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
                className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-600/50 hover:bg-rose-900/20 hover:text-white transition-all rounded-sm ml-2"
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

      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>
    </div>
  );
}