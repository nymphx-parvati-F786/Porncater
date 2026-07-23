import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import {
  FolderOpen, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Clock, Sparkles, MonitorPlay,
  Star, Filter, TrendingUp, Menu, Search, Video, Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/src/components/ui/SearchBar";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards, blackedLeaderboards } from "@/src/data/adConfig";
import SmartHeader from "@/src/components/ui/SmartHeader";

export const revalidate = 120; // Cache category pages for 2 minutes on CDN

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 🔥 Sleek Category Title Formatting Helper
const formatCategoryTitle = (slug: string) => {
  const decoded = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ");
  const upperAcronyms = ["bbc", "milf", "pov", "vr", "bdsm", "hd"];

  return decoded
    .split(" ")
    .map(word => upperAcronyms.includes(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

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
// 🚀 CATEGORY SEO ENGINE: DYNAMIC METADATA
// =========================================================
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const page = resolvedSearchParams.page ? String(resolvedSearchParams.page) : "1";
  const displayTitle = formatCategoryTitle(slug);
  const canonicalUrl = `https://porncater.com/category/${slug}?page=${page}`;

  return {
    title: `Free ${displayTitle} Porn Videos & HD XXX Clips - Page ${page} | PornCater`,
    description: `Watch the absolute best free ${displayTitle} porn videos, top amateur scenes, and premium adult cinema. Updated daily on PornCater.`,
    keywords: `${displayTitle} porn, free ${displayTitle} videos, HD sex tube, XXX ${displayTitle} clips, adult movies`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Free ${displayTitle} Porn Videos | PornCater`,
      description: `Stream premium HD ${displayTitle} adult clips and trending scenes.`,
      url: canonicalUrl,
      type: "website",
    },
  };
}

// =========================================================
// 🎬 PRIMARY CATEGORY COMPONENT
// =========================================================
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;
  const displayTitle = formatCategoryTitle(slug);
  const rawSearchQuery = slug.replace(/-/g, " ");

  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const currentSort = (resolvedSearchParams.sort as string) || "newest";

  const videosPerPage = 24; // 24 videos + 6 native ads = perfect 30 item grid
  const skipAmount = (currentPage - 1) * videosPerPage;

  // Define dynamic Prisma sort order based on filter selection
  let prismaOrderBy: Prisma.VideoOrderByWithRelationInput = { createdAt: "desc" };
  if (currentSort === "most-viewed") {
    prismaOrderBy = { views: "desc" };
  } else if (currentSort === "top-rated") {
    prismaOrderBy = { likes: "desc" };
  }

  // Matching Clause: Searches category column, tags array, or title string
  const whereClause: Prisma.VideoWhereInput = {
    status: "PUBLISHED",
    OR: [
      { category: { equals: rawSearchQuery, mode: "insensitive" } },
      { tags: { has: rawSearchQuery.toLowerCase() } },
      { title: { contains: rawSearchQuery, mode: "insensitive" } }
    ]
  };

  // =========================================================================
  // 🚀 DEFERRED JOIN DATA FETCHING FOR CATEGORY PAGES
  // =========================================================================

  // Step A: Fast Index-Only Scan to grab matching IDs
  const videoIds = await prisma.video.findMany({
    where: whereClause,
    select: { id: true },
    orderBy: prismaOrderBy,
    skip: skipAmount,
    take: videosPerPage,
  });

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full row details for the selected IDs
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
    // Preserve sorted order from Step A
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Step C: Count total matching items for pagination
  const totalCount = await prisma.video.count({ where: whereClause });

  const hardPageLimit = 200;
  const calculatedPages = Math.ceil(totalCount / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  // =========================================================================

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const buildPageUrl = (page: number | string) => `/category/${slug}?page=${page}&sort=${currentSort}`;

  // Structured Data Schema for Category SEO Graph
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Free ${displayTitle} Porn Videos - PornCater`,
    "description": `Browse the best collection of ${displayTitle} adult scenes and HD sex videos on PornCater.`,
    "url": `https://porncater.com/category/${slug}`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://porncater.com/category/" },
      { "@type": "ListItem", "position": 3, "name": displayTitle, "item": `https://porncater.com/category/${slug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* Inject SEO Schema Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([categorySchema, breadcrumbSchema]) }}
      />

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

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
            <FolderOpen className="text-rose-700" size={32} strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide flex items-center gap-2">
                {displayTitle} Videos
                <span className="bg-rose-700 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-widest not-italic hidden sm:block uppercase">
                  NICHE
                </span>
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} {displayTitle} Scenes
              </p>
            </div>
          </div>

          {/* 🔥 FUNCTIONAL SORT BAR FOR CATEGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white">
              <SlidersHorizontal size={14} className="text-zinc-400" /> Sort
            </div>

            <Link
              href={`/category/${slug}?sort=newest`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "newest"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Newest
            </Link>

            <Link
              href={`/category/${slug}?sort=most-viewed`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "most-viewed"
                  ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                  : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Most Viewed
            </Link>

            <Link
              href={`/category/${slug}?sort=top-rated`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "top-rated"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">

          {/* 1. Real Category Videos */}
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
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32">
              <FolderOpen className="text-zinc-700 w-16 h-16 mb-4" />
              <p className="text-zinc-500 text-lg font-light tracking-wide uppercase">No videos found for this category.</p>
            </div>
          )}

          {/* 2. Camouflaged Native Ads */}
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
                  className={`w-10 h-10 flex items-center justify-center text-xs font-mono transition-all rounded-sm border ${currentPage === pageNum
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