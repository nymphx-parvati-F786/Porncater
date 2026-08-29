import { prisma } from "@/lib/prisma";
import { getTopBannerAd } from "@/src/lib/ads";
import { Metadata } from "next";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Play,
  User,
  Clock,
  Sparkles,
  MonitorPlay,
  Star,
  ThumbsUp,
  Filter,
  TrendingUp,
  Menu,
  Search,
  Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";

export const revalidate = 120; // Caches the page for 2 minutes

export const metadata: Metadata = {
  title: "Trending Porn Videos",
  description:
    "Watch the hottest trending porn videos on PornCater. Discover the most viewed and top-rated sex tube scenes updated right now.",
  alternates: { canonical: "https://www.porncater.com/trending" },
};

const formatDuration = (seconds: number | string | null | undefined) => {
  if (!seconds) return "";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};
export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  // 🔥 24 Videos fills a 6-column grid perfectly (4 rows)
  const videosPerPage = 36;
  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);
  const skipAmount = (currentPage - 1) * videosPerPage;

  // =========================================================================
  // 🚀 HIGH-PERFORMANCE DATA FETCHING ARCHITECTURE (DEFERRED JOIN)
  // =========================================================================

  // Step A: Fast Index-Only scan.
  // Postgres leverages your @@index([views(sort: Desc)]) perfectly here.
  const videoIds = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
    orderBy: { views: "desc" },
    skip: skipAmount,
    take: videosPerPage,
  });

  const ids = videoIds.map((v) => v.id);

  // Step B: Fetch full data only for those specific IDs
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
    // Map them back into the exact sorted order retrieved from Step A
    videos = ids
      .map((id) => unorderedVideos.find((v) => v.id === id))
      .filter(Boolean);
  }

  // Step C: Blazing fast estimated count bypasses the Postgres full-table scan lock
  const tableStats = await prisma.$queryRaw<{ estimate: number }[]>`
    SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'Video';
  `;

  const estimatedTotal = Number(tableStats[0]?.estimate || 0);

  // Step D: SEO Hard Cap - Never let bots crawl past page 200
  const hardPageLimit = 200;
  const calculatedPages = Math.ceil(estimatedTotal / videosPerPage);
  const totalPages = Math.max(1, Math.min(calculatedPages, hardPageLimit));

  // =========================================================================

  const generatePagination = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const megaCategories = [
    "BBC",
    "Lesbian",
    "Cuckold",
    "Blowjob",
    "Creampie",
    "MILF",
    "Teen",
    "Anal",
    "Threesome",
    "Interracial",
    "Amateur",
    "BDSM",
    "POV",
    "Asian",
    "Ebony",
    "Latina",
    "Big Tits",
    "Cosplay",
    "Vintage",
    "VR",
  ];

  // Fetch desktop and mobile ads concurrently
  const [topDesktopAd, topMobileAd] = await Promise.all([
    getTopBannerAd("970x70"),
    getTopBannerAd("300x100"),
  ]);

  // Add this inside the component, right before return:
  const canonicalUrl = `https://www.porncater.com/trending${currentPage > 1 ? `?page=${currentPage}` : ""}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.porncater.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Trending Videos",
        item: "https://www.porncater.com/trending",
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending Porn Videos",
    url: canonicalUrl,
    numberOfItems: videos.length,
    itemListElement: videos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.porncater.com/video/${video.id}/${video.slug}`,
      name: video.title,
      image: video.thumbnail,
    })),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* Inject SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, itemListSchema]),
        }}
      />

      {/* =========================================
          💰 TOP DYNAMIC AFFILIATE BANNER
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2 flex justify-center">
        <AdBanner
          dimension="970x70"
          priority={true}
          initialAd={topDesktopAd}
          className="hidden md:block w-full max-w-[970px]"
        />
        <AdBanner
          dimension="300x100" // Updated to standard 300x250 box for mobile
          priority={true}
          initialAd={topMobileAd}
          className="block md:hidden mx-auto"
        />
      </div>

      {/* =========================================
          🔥 TRENDING VIDEOS GRID
          ========================================= */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-3">
            <Flame className="text-rose-800" size={28} strokeWidth={1.5} />
            <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide">
              Trending Right Now
            </h1>
          </div>
          <span className="text-zinc-500 text-xs tracking-widest uppercase font-bold">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <Link
                key={video.id}
                href={`/video/${video.id}/${video.slug}`}
                prefetch={false}
                className="group flex flex-col"
              >
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
                <div className="mt-2 flex flex-col grow">
                  <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-75">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-zinc-500 text-[11px] mt-auto pt-1.5 font-medium">
                    <span>
                      {Number(video.views || 0).toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500">
                      <ThumbsUp size={12} /> {Number(video.likes || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 font-light tracking-wide text-lg">
                No videos found.
              </p>
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
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-zinc-600"
                  >
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

      {/* 3. 🔥 BFORE FOOTER AD BANNER 900x250 */}
      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>
    </div>
  );
}
