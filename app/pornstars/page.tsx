import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Star, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";

export const revalidate = 120;

interface DirectoryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// =========================================================
// 🚀 PORNSTAR DIRECTORY SEO ENGINE
// =========================================================
export async function generateMetadata({ searchParams }: DirectoryProps): Promise<Metadata> {
  const resolved = await searchParams;
  const letter = (resolved.letter as string) || "";
  const page = resolved.page ? String(resolved.page) : "1";
  const currentPage = Math.max(1, parseInt(page) || 1);

  const isFiltered = !!letter;
  const titleBase = isFiltered
    ? `${letter.toUpperCase()} Pornstars`
    : "Pornstars Directory";

  const title = currentPage > 1
    ? `${titleBase} - Page ${currentPage} | PornCater`
    : `${titleBase} - Free HD Porn Videos | PornCater`;

  const description = isFiltered
    ? `Browse top ${letter.toUpperCase()} pornstars. Watch free HD porn videos from the hottest adult stars starting with ${letter.toUpperCase()}. Updated daily on PornCater.`
    : `Browse thousands of pornstars. Watch free HD porn videos from the most popular adult stars. Updated daily on PornCater.`;

  // Canonical logic
  let canonical = "https://porncater.com/pornstars";
  const params = new URLSearchParams();
  if (letter) params.set("letter", letter);
  if (currentPage > 1) params.set("page", String(currentPage));
  const query = params.toString();
  if (query) canonical += `?${query}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "PornCater",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PornstarsDirectory({ searchParams }: DirectoryProps) {
  const resolvedSearchParams = await searchParams;

  const searchQuery = (resolvedSearchParams.search as string) || "";
  const letterQuery = (resolvedSearchParams.letter as string) || "";
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const performersPerPage = 36;

  let queryCondition: any = {};
  if (searchQuery) {
    queryCondition.name = { contains: searchQuery, mode: "insensitive" };
  } else if (letterQuery) {
    queryCondition.name = { startsWith: letterQuery, mode: "insensitive" };
  }

  const [pornstars, totalPerformers] = await Promise.all([
    prisma.pornstar.findMany({
      where: queryCondition,
      take: performersPerPage,
      skip: (currentPage - 1) * performersPerPage,
      orderBy: { views: "desc" },
      include: {
        _count: {
          select: { videos: true },
        },
      },
    }),
    prisma.pornstar.count({ where: queryCondition }),
  ]);

  const totalPages = Math.ceil(totalPerformers / performersPerPage) || 1;

  // Canonical for schema
  let canonicalUrl = "https://porncater.com/pornstars";
  const params = new URLSearchParams();
  if (letterQuery) params.set("letter", letterQuery);
  if (currentPage > 1) params.set("page", String(currentPage));
  const queryString = params.toString();
  if (queryString) canonicalUrl += `?${queryString}`;

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // =========================================================
  // 🔥 MAXIMUM PORN SEO SCHEMA (Breadcrumb + CollectionPage + ItemList)
  // =========================================================
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://porncater.com/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pornstars",
        "item": "https://porncater.com/pornstars",
      },
    ],
  };

  // Add letter as 3rd breadcrumb level when filtered
  if (letterQuery) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": `${letterQuery.toUpperCase()} Pornstars`,
      "item": `https://porncater.com/pornstars?letter=${letterQuery}`,
    });
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": letterQuery
      ? `Pornstars starting with ${letterQuery.toUpperCase()}`
      : "Top Pornstars",
    "description": `Browse ${totalPerformers.toLocaleString()} pornstars on PornCater`,
    "numberOfItems": pornstars.length,
    "itemListOrder": "https://schema.org/ItemListOrderDescending",
    "itemListElement": pornstars.map((star, index) => ({
      "@type": "ListItem",
      "position": (currentPage - 1) * performersPerPage + index + 1,
      "url": `https://porncater.com/pornstars/${star.slug}`,
      "name": star.name,
      "image": star.avatarUrl || "https://porncater.com/thumbnails/default-avatar.png",
    })),
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": letterQuery
      ? `${letterQuery.toUpperCase()} Pornstars - Page ${currentPage}`
      : `Pornstars Directory - Page ${currentPage}`,
    "description": letterQuery
      ? `Free HD porn videos from pornstars starting with ${letterQuery.toUpperCase()}. ${totalPerformers.toLocaleString()} models available.`
      : `Browse the complete pornstars directory. ${totalPerformers.toLocaleString()} top adult stars with free HD videos.`,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "PornCater",
      "url": "https://porncater.com",
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalPerformers,
      "itemListElement": itemListSchema.itemListElement,
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans selection:bg-rose-600 selection:text-white flex flex-col">
      {/* 🔥 SUPER SEO SCHEMA GRAPH */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, collectionPageSchema, itemListSchema]),
        }}
      />

      <SmartHeader categories={megaCategories} />

      {/* =========================================
          🎬 RAW TUBE HEADER & A-Z INDEX
          ========================================= */}
      <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4 pt-6 pb-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Star className="text-rose-600" size={18} fill="currentColor" />
            {letterQuery ? `${letterQuery.toUpperCase()} Pornstars` : "Pornstars"}
          </h1>
          <span className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            {totalPerformers.toLocaleString()} Models
          </span>
        </div>

        {/* Brutalist A-Z Tube Filtering Bar */}
        <div className="flex flex-wrap gap-[1px] bg-zinc-800 border border-zinc-800 p-[1px] mb-4">
          <Link
            href="/pornstars"
            className={`flex-1 min-w-[30px] py-1.5 text-center text-[10px] sm:text-xs font-bold uppercase transition-none ${
              !letterQuery && !searchQuery
                ? "bg-rose-700 text-white"
                : "bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            All
          </Link>
          {alphabet.map((letter) => (
            <Link
              key={letter}
              href={`/pornstars?letter=${letter}`}
              className={`flex-1 min-w-[24px] py-1.5 text-center text-[10px] sm:text-xs font-bold transition-none ${
                letterQuery === letter
                  ? "bg-rose-700 text-white"
                  : "bg-[#050505] text-zinc-500 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================
          🔥 DENSE TUBE GRID
          ========================================= */}
      <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4 flex-grow">
        {pornstars.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2.5">
              {pornstars.map((star, index) => {
                const globalRank = (currentPage - 1) * performersPerPage + (index + 1);

                return (
                  <Link
                    key={star.slug}
                    href={`/pornstars/${star.slug}`}
                    className="group flex flex-col bg-[#111] border border-zinc-900 hover:border-rose-700 transition-none"
                  >
                    <div className="relative w-full aspect-[3/4] bg-black overflow-hidden">
                      <img
                        src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                        alt={star.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-[50%_20%] group-hover:opacity-80 transition-none"
                      />

                      <div className="absolute top-0 left-0 bg-rose-700 text-white text-[10px] font-bold px-1.5 py-0.5">
                        #{globalRank}
                      </div>

                      <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 flex items-center gap-1">
                        <PlayCircle size={10} className="fill-black text-amber-500" />
                        {star._count?.videos || 0}
                      </div>
                    </div>

                    <div className="p-2 flex flex-col bg-[#111]">
                      <h4 className="text-zinc-300 font-bold text-xs truncate group-hover:text-rose-500 transition-none">
                        {star.name}
                      </h4>
                      <div className="text-zinc-600 text-[9px] uppercase tracking-widest font-bold mt-0.5">
                        {star.views ? Number(star.views).toLocaleString() : "0"} Views
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 mb-8 flex items-center justify-center gap-1 select-none">
                {currentPage > 1 ? (
                  <Link
                    href={`/pornstars?${letterQuery ? `letter=${letterQuery}&` : ""}page=${currentPage - 1}`}
                    className="h-8 px-3 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-none"
                  >
                    <ChevronLeft size={14} /> Prev
                  </Link>
                ) : (
                  <div className="h-8 px-3 flex items-center justify-center bg-black border border-zinc-900 text-zinc-700 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed">
                    <ChevronLeft size={14} /> Prev
                  </div>
                )}

                <div className="hidden sm:flex gap-1">
                  {generatePagination().map((pageNum, index) => {
                    if (pageNum === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="w-8 h-8 flex items-end justify-center pb-1 text-zinc-600 font-bold tracking-widest text-sm"
                        >
                          ...
                        </span>
                      );
                    }
                    const isCurrent = currentPage === pageNum;
                    return (
                      <Link
                        key={pageNum}
                        href={`/pornstars?${letterQuery ? `letter=${letterQuery}&` : ""}page=${pageNum}`}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-none ${
                          isCurrent
                            ? "bg-rose-700 text-white border border-rose-700"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={`/pornstars?${letterQuery ? `letter=${letterQuery}&` : ""}page=${currentPage + 1}`}
                    className="h-8 px-3 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-none"
                  >
                    Next <ChevronRight size={14} />
                  </Link>
                ) : (
                  <div className="h-8 px-3 flex items-center justify-center bg-black border border-zinc-900 text-zinc-700 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed">
                    Next <ChevronRight size={14} />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#111] border border-zinc-900 py-20 text-center mt-4">
            <Star className="mx-auto text-zinc-800 mb-3" size={40} />
            <div className="text-zinc-500 font-bold tracking-widest uppercase text-xs">
              No pornstars found matching "{letterQuery}".
            </div>
            <Link
              href="/pornstars"
              className="inline-block mt-4 text-rose-600 hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest"
            >
              Clear Filter
            </Link>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center my-1 overflow-hidden">
        <AdRotator />
      </div>
    </div>
  );
}