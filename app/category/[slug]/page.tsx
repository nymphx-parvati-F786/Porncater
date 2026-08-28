import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import {
  FolderOpen, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";

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
  if (!seconds) return "";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
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

// =========================================================
// 🚀 CATEGORY SEO ENGINE: DYNAMIC METADATA
// =========================================================
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const page = resolvedSearchParams.page ? String(resolvedSearchParams.page) : "1";
  const displayTitle = formatCategoryTitle(slug);
  const canonicalUrl = `https://www.porncater.com/category/${slug}${page !== "1" ? `?page=${page}` : ""}`;

  return {
    title: `Free ${displayTitle} Porn Videos & HD XXX Clips - Page ${page}`,
    description: `Watch the absolute best free ${displayTitle} porn videos, top amateur scenes, and premium adult cinema. Updated daily on PornCater.`,
    keywords: `${displayTitle} porn, free ${displayTitle} videos, HD sex tube, XXX ${displayTitle} clips, adult movies`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Free ${displayTitle} Porn Videos`,
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

  const videosPerPage = 24;
  const skipAmount = (currentPage - 1) * videosPerPage;

  // =========================================================================
  // 🚀 HIGH-PERFORMANCE RAW SQL CATEGORY FETCHING
  // =========================================================================

  let videoIds: { id: number }[] = [];

  // Exact match on Category/Tags, Fuzzy match on Title using Trigram
  if (currentSort === "most-viewed") {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (category ILIKE ${rawSearchQuery} OR ${rawSearchQuery.toLowerCase()} = ANY(tags) OR title % ${rawSearchQuery})
      ORDER BY views DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  } else if (currentSort === "newest") {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (category ILIKE ${rawSearchQuery} OR ${rawSearchQuery.toLowerCase()} = ANY(tags) OR title % ${rawSearchQuery})
      ORDER BY "createdAt" DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  } else {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (category ILIKE ${rawSearchQuery} OR ${rawSearchQuery.toLowerCase()} = ANY(tags) OR title % ${rawSearchQuery})
      ORDER BY likes DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  }

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full row details for the selected IDs
  let videos: any[] = [];
  if (ids.length > 0) {
    const unorderedVideos = await prisma.video.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, slug: true, title: true, thumbnail: true,
        duration: true, views: true, likes: true,
      },
    });
    // Preserve sorted order from Step A
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Fetch count and Ads concurrently for maximum speed
  const [countResult, topDesktopAd, topMobileAd] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (category ILIKE ${rawSearchQuery} OR ${rawSearchQuery.toLowerCase()} = ANY(tags) OR title % ${rawSearchQuery});
    `,
    getTopBannerAd("970x70"),
    getTopBannerAd("300x100") // 🔥 Fixed mobile ad dimension to 300x250 standard
  ]);

  const totalCount = Number(countResult[0]?.count || 0);
  const hardPageLimit = 200;
  const calculatedPages = Math.ceil(totalCount / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const buildPageUrl = (page: number | string) => `/category/${slug}?page=${page}&sort=${currentSort}`;
  const canonicalUrl = `https://www.porncater.com/category/${slug}${currentPage !== 1 ? `?page=${currentPage}` : ""}`;

  // =========================================================
  // 🚀 SUPER JSON-LD SCHEMA INJECTION
  // =========================================================

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Free ${displayTitle} Porn Videos - PornCater`,
    "description": `Browse the best collection of ${displayTitle} adult scenes and HD sex videos on PornCater.`,
    "url": canonicalUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://www.porncater.com/category/" },
      { "@type": "ListItem", "position": 3, "name": displayTitle, "item": canonicalUrl }
    ]
  };

  // 🔥 THE NEW ITEMLIST SCHEMA (Ranks category grids instantly on Google)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Top ${displayTitle} Porn Videos`,
    "url": canonicalUrl,
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.porncater.com/video/${video.id}/${video.slug}`,
      "name": video.title,
      "image": video.thumbnail
    }))
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* Inject SEO Schema Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([categorySchema, breadcrumbSchema, itemListSchema]) }}
      />

      <SmartHeader categories={megaCategories} />

      {/* TOP DYNAMIC AFFILIATE BANNER */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2 flex justify-center">
        <AdBanner
          dimension="970x70"
          priority={true}
          initialAd={topDesktopAd}
          className="hidden md:block w-full max-w-[970px]"
        />
        <AdBanner
          dimension="300x100"
          priority={true}
          initialAd={topMobileAd}
          className="block md:hidden mx-auto"
        />
      </div>

      {/* DIRECTORY HEADER & DYNAMIC FILTERS */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="text-rose-600" size={32} strokeWidth={1.5} />
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

      {/* THE 24-CARD VIDEO GRID */}
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
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><ThumbsUp size={12} /> {Number(video.likes || 0).toLocaleString()}</span>
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
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 flex items-center justify-center gap-2">
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

            {generatePagination().map((pageNum, index) => {
              if (pageNum === "...") {
                return <span key={`ellipsis-${index}`} className="px-2 text-zinc-600">...</span>;
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

      {/* BOTTOM-ROLL AD BANNER */}
      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>
    </div>
  );
}