import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import {
  Search as SearchIcon, ChevronLeft, ChevronRight, ThumbsUp,
  SlidersHorizontal, Flame
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";

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
// 🚀 SEARCH SEO ENGINE: DYNAMIC METADATA
// =========================================================
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
  const page = resolvedParams.page ? String(resolvedParams.page) : "1";

  if (!q) {
    return { title: "Search Free HD Porn Videos | PornCater" };
  }

  const canonicalUrl = `https://porncater.com/search?q=${encodeURIComponent(q)}${page !== "1" ? `&page=${page}` : ""}`;

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

  // =========================================================================
  // 🚀 DEFERRED JOIN RAW TRIGRAM ARCHITECTURE 
  // =========================================================================

  const wildcardQuery = `%${q}%`;
  let videoIds: { id: number }[] = [];

  // Step A: Index-Only Scan using pg_trgm % operator
  if (currentSort === "most-viewed") {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (
          title ILIKE ${wildcardQuery} 
          OR category ILIKE ${wildcardQuery} 
          OR array_to_string(tags, ' ') ILIKE ${wildcardQuery}
          OR title % ${q}
        )
      ORDER BY views DESC, similarity(title, ${q}) DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  } else if (currentSort === "newest") {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (
          title ILIKE ${wildcardQuery} 
          OR category ILIKE ${wildcardQuery} 
          OR array_to_string(tags, ' ') ILIKE ${wildcardQuery}
          OR title % ${q}
        )
      ORDER BY "createdAt" DESC, similarity(title, ${q}) DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  } else {
    videoIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (
          title ILIKE ${wildcardQuery} 
          OR category ILIKE ${wildcardQuery} 
          OR array_to_string(tags, ' ') ILIKE ${wildcardQuery}
          OR title % ${q}
        )
      ORDER BY likes DESC, similarity(title, ${q}) DESC
      LIMIT ${videosPerPage} OFFSET ${skipAmount};
    `;
  }

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full row details
  let videos: any[] = [];
  if (ids.length > 0) {
    const unorderedVideos = await prisma.video.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, slug: true, title: true, thumbnail: true, duration: true, views: true, likes: true,
      },
    });
    videos = ids.map(id => unorderedVideos.find(v => v.id === id)).filter(Boolean);
  }

  // Step C: Concurrent requests for Count and Top Banner Ads
  const [countResult, topDesktopAd, topMobileAd] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "Video"
      WHERE status = 'PUBLISHED' 
        AND (
          title ILIKE ${wildcardQuery} 
          OR category ILIKE ${wildcardQuery} 
          OR array_to_string(tags, ' ') ILIKE ${wildcardQuery}
          OR title % ${q}
        );
    `,
    getTopBannerAd("970x70"),
    getTopBannerAd("300x250") // Standardized mobile ad format
  ]);

  const totalCount = Number(countResult[0]?.count || 0);
  const hardPageLimit = 100;
  const calculatedPages = Math.ceil(totalCount / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const buildPageUrl = (page: number | string) => `/search?q=${encodeURIComponent(q)}&page=${page}&sort=${currentSort}`;
  const canonicalUrl = `https://porncater.com/search?q=${encodeURIComponent(q)}${currentPage !== 1 ? `&page=${currentPage}` : ""}`;

  // =========================================================
  // 🚀 SUPER JSON-LD SCHEMA INJECTION
  // =========================================================

  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Porn Search Results for "${q}" - PornCater`,
    "url": canonicalUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Search", "item": "https://porncater.com/search" },
      { "@type": "ListItem", "position": 3, "name": q, "item": canonicalUrl }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Top Search Results for ${q}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([searchSchema, breadcrumbSchema, itemListSchema]) }}
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

      {/* SEARCH HEADER & DYNAMIC FILTERS */}
      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <SearchIcon className="text-rose-600" size={32} strokeWidth={2} />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600">Search Query:</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide truncate max-w-xl">
                "{q}"
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1 font-bold">
                Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} Matching Videos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white">
              <SlidersHorizontal size={14} className="text-zinc-400" /> Sort
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=most-viewed`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "most-viewed"
                ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Most Viewed
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=newest`}
              className={`px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${currentSort === "newest"
                ? "bg-rose-900/20 text-rose-500 border border-rose-900/50"
                : "bg-[#111] hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
            >
              Newest
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(q)}&sort=top-rated`}
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
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {videos.map((video, index) => (
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
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><ThumbsUp size={12} /> 98%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center border border-zinc-800/80 rounded-sm bg-[#111]">
            <Flame size={48} className="text-rose-600 mb-4 animate-bounce" />
            <h3 className="text-2xl font-serif italic text-white mb-2">No videos matched "{q}"</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1 max-w-md mx-auto leading-relaxed">
              Try searching with broader terms, single keywords, or browse popular niches below.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl px-4">
              {megaCategories.slice(0, 10).map((cat, i) => (
                <Link
                  key={i}
                  href={`/category/${cat.toLowerCase()}`}
                  className="bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-600/60 text-zinc-300 hover:text-white px-3 py-1.5 text-xs uppercase font-bold tracking-wider rounded-sm transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

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

      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>
    </div>
  );
}