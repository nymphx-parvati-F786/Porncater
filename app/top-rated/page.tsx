import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import {
  Star, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Clock, Sparkles, MonitorPlay,
  Filter, TrendingUp, Menu, Search, Video, PlayCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/src/components/ui/SearchBar";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Top Rated Porn Videos | Best Adult Cinema - PornCater",
  description: "Watch the highest rated free HD porn videos and top voted adult scenes. Hand-picked community favorites updated daily on PornCater.",
  keywords: "top rated porn, best sex videos, highest voted porn, HD adult cinema, popular tube scenes",
  alternates: { canonical: "https://porncater.com/top-rated" },
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

export default async function TopRatedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;

  // Extract time filter parameter (all-time, month, week)
  const timeFilter = (resolvedParams.time as string) || "all-time";
  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);
  const videosPerPage = 36;
  const skipAmount = (currentPage - 1) * videosPerPage;

  // Build dynamic date filters for Prisma
  let dateFilter = {};
  const now = new Date();
  if (timeFilter === "week") {
    const lastWeek = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { createdAt: { gte: lastWeek } };
  } else if (timeFilter === "month") {
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    dateFilter = { createdAt: { gte: lastMonth } };
  }

  const whereClause = {
    status: "PUBLISHED" as const,
    ...dateFilter,
  };

  // =========================================================================
  // 🚀 HIGH-PERFORMANCE DATA FETCHING ARCHITECTURE (DEFERRED JOIN)
  // =========================================================================

  // Step A: Fast Index-Only scan to get JUST the IDs
  const videoIds = await prisma.video.findMany({
    where: whereClause,
    select: { id: true },
    orderBy: { likes: "desc" },
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
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Step C: Concurrent requests for Count and Top Banner Ads
  let countPromise;
  if (timeFilter === "all-time") {
    countPromise = prisma.$queryRaw<{ estimate: number }[]>`SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'Video';`
      .then(res => Number(res[0]?.estimate || 0));
  } else {
    countPromise = prisma.video.count({ where: whereClause });
  }

  const [estimatedTotal, topDesktopAd, topMobileAd] = await Promise.all([
    countPromise,
    getTopBannerAd("970x70"),
    getTopBannerAd("300x250") // Standardized mobile size
  ]);

  // Step D: SEO Hard Cap - Never let bots crawl past page 200
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

  const buildPageUrl = (page: number | string) => `/top-rated?page=${page}&time=${timeFilter}`;
  const canonicalUrl = `https://porncater.com/top-rated${currentPage !== 1 ? `?page=${currentPage}&time=${timeFilter}` : `?time=${timeFilter}`}`;

  // =========================================================
  // 🚀 SUPER JSON-LD SCHEMA INJECTION
  // =========================================================

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Top Rated Videos", "item": canonicalUrl }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Rated Porn Videos",
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
          dimension="300x1000"
          priority={true}
          initialAd={topMobileAd}
          className="block md:hidden mx-auto"
        />
      </div>

      {/* Title & Time-Range Filter Bar */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">

          <div className="flex items-center gap-3">
            <Star className="text-rose-600" size={28} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide flex items-center gap-2">
                Top Rated Videos
                <span className="bg-amber-600/20 text-amber-400 border border-amber-500/40 font-sans text-[10px] px-2 py-0.5 rounded-sm tracking-widest not-italic hidden sm:block">
                  BEST OF
                </span>
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {estimatedTotal.toLocaleString()} Rated Scenes
              </p>
            </div>
          </div>

          {/* Time Filter Controls */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white">
              <SlidersHorizontal size={14} className="text-zinc-400" /> Timeframe
            </div>

            <Link
              href="/top-rated?time=all-time"
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${timeFilter === "all-time"
                ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              All Time
            </Link>

            <Link
              href="/top-rated?time=month"
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${timeFilter === "month"
                ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              This Month
            </Link>

            <Link
              href="/top-rated?time=week"
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${timeFilter === "week"
                ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              This Week
            </Link>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

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
                  <div className="absolute top-1.5 left-1.5 bg-rose-700/90 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                    <Star size={10} className="fill-white" /> #{((currentPage - 1) * videosPerPage) + index + 1}
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
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><ThumbsUp size={12} /> 99%</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32">
              <Star className="text-zinc-700 w-16 h-16 mb-4" />
              <p className="text-zinc-500 text-lg font-light tracking-wide uppercase">No top rated videos found for this timeframe.</p>
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

      {/* Bottom Ad Leaderboard */}
      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505]">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-600 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-600 pr-1">Porn</span>
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