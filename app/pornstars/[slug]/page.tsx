import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Share2, Play, Eye, Film, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { notFound } from "next/navigation";
import SmartHeader from "@/src/components/ui/SmartHeader";
import SubscribeButton from "@/src/components/ui/SubscribeButton";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

// =========================================================
// 🚀 PORNSTAR SEO ENGINE: DYNAMIC METADATA
// =========================================================
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const starSlug = resolvedParams.slug;
  const page = resolvedSearchParams.page ? String(resolvedSearchParams.page) : "1";

  const star = await prisma.pornstar.findUnique({
    where: { slug: starSlug },
    select: { name: true, bio: true }
  });

  if (!star) return { title: 'Pornstar Not Found | PornCater' };

  const canonicalUrl = `https://porncater.com/pornstars/${starSlug}?page=${page}`;
  
  return {
    title: `${star.name} Porn Videos & Profile - Page ${page} | PornCater`,
    description: star.bio 
      ? `${star.name} bio: ${star.bio.substring(0, 120)}... Stream exclusive HD videos.` 
      : `Watch exclusive HD porn videos featuring ${star.name} on PornCater.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${star.name} Porn Videos | PornCater`,
      type: 'profile',
    }
  };
}

// =========================================================
// 🎬 PRIMARY COMPONENT
// =========================================================
export default async function PornstarProfile({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const starSlug = resolvedParams.slug;
  if (!starSlug) return notFound();

  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const videosPerPage = 24; // 🔥 Increased density for tube feel

  // 1. Fetch the pornstar bio
  const star = await prisma.pornstar.findFirst({
    where: {
      slug: {
        equals: decodeURIComponent(starSlug),
        mode: "insensitive"
      }
    }
  });

  if (!star) return notFound();

  // 2. Fetch videos with DMCA Shield + Pagination
  const [videos, totalVideos] = await Promise.all([
    prisma.video.findMany({
      where: {
        status: "PUBLISHED", 
        pornstars: {
          some: { id: star.id }
        }
      },
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true }
    }),
    prisma.video.count({
      where: {
        status: "PUBLISHED",
        pornstars: {
          some: { id: star.id }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(totalVideos / videosPerPage);
  const canonicalUrl = `https://porncater.com/pornstars/${star.slug}?page=${currentPage}`;

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // SEO SCHEMAS
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Pornstars", "item": "https://porncater.com/pornstars/" },
      { "@type": "ListItem", "position": 3, "name": star.name, "item": `https://porncater.com/pornstars/${star.slug}` }
    ]
  };
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": star.name,
    "description": star.bio || `Adult film actress ${star.name} profile and video collection.`,
    "image": star.avatarUrl,
    "url": `https://porncater.com/pornstars/${star.slug}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": star.views || 0
    }
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${star.name} Porn Videos - Page ${currentPage}`,
    "url": canonicalUrl,
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoObject",
        "name": video.title,
        "url": `https://porncater.com/watch/${video.id}/${video.slug}`,
        "thumbnailUrl": video.thumbnail
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans selection:bg-rose-600 selection:text-white flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, personSchema, itemListSchema]) }} />
      
      {/* 🔥 THE UNIFIED SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* =========================================
          🔥 RAW TUBE PROFILE HEADER
          ========================================= */}
      <div className="bg-[#111] border-b border-zinc-900 pt-6 pb-6 shadow-md">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          
          {/* Portrait Avatar (Matching Directory Style) */}
          <div className="relative w-28 h-36 sm:w-36 sm:h-48 shrink-0 bg-black border border-zinc-800 overflow-hidden">
            <img
              src={star.avatarUrl || "/thumbnails/default-avatar.png"}
              alt={star.name}
              className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
            />
          </div>

          {/* Profile Data Plate */}
          <div className="flex-1 w-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800 pb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-white mb-1">
                  {star.name}
                </h1>
                <p className="text-rose-600 text-[9px] uppercase tracking-widest font-black">
                  Verified Model
                </p>
              </div>

              {/* Action Buttons (Brutalist) */}
              <div className="flex gap-1.5">
                <SubscribeButton />
                <button className="px-3 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-none text-[10px] font-bold uppercase tracking-widest">
                  <Share2 size={14} className="mr-1.5" /> Share
                </button>
              </div>
            </div>

            {/* Brutalist Stats Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 mb-4 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <div className="flex flex-col">
                <span className="text-white text-sm font-black">{totalVideos}</span>
                Videos
              </div>
              <div className="flex flex-col border-l border-zinc-800 pl-6">
                <span className="text-white text-sm font-black">{star.views ? Number(star.views).toLocaleString() : "0"}</span>
                Total Views
              </div>
              <div className="flex flex-col border-l border-zinc-800 pl-6">
                <span className="text-white text-sm font-black">{star.subscribers || "0"}</span>
                Subscribers
              </div>
            </div>

            {/* Bio & Tags */}
            {star.bio && (
              <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-4xl mb-3 line-clamp-3">
                {star.bio}
              </p>
            )}
            
            {star.tags && star.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {star.tags.map((tag: string, i: number) => (
                  <Link key={i} href={`/category/${tag.toLowerCase()}`} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 transition-none">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          🔥 DENSE VIDEO GRID
          ========================================= */}
      <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4 mt-6 flex-grow">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Film className="text-rose-600" size={18} />
            Videos
          </h2>
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>

        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2.5">
              {videos.map((video) => (
                <Link 
                  key={video.id} 
                  href={`/watch/${video.id}/${video.slug}`} 
                  prefetch={false} 
                  className="group flex flex-col bg-[#111] border border-zinc-900 hover:border-rose-700 transition-none"
                >
                  {/* Raw Image Container */}
                  <div className="relative w-full aspect-video bg-black overflow-hidden">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover group-hover:opacity-80 transition-none"
                    />
                    
                    {/* Sharp HD Badge */}
                    <div className="absolute top-0 left-0 bg-rose-700 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                      HD
                    </div>

                    {/* Sharp Duration Badge */}
                    <div className="absolute bottom-0 right-0 bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wider border-t border-l border-zinc-800">
                      {video.duration || "0:00"}
                    </div>
                  </div>

                  {/* Data Plate - Tight & Minimal */}
                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="font-bold text-zinc-300 text-xs line-clamp-2 leading-tight group-hover:text-rose-500 transition-none">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-2 text-zinc-600 text-[9px] uppercase tracking-widest font-bold">
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {video.views ? Number(video.views).toLocaleString() : "0"}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <ThumbsUp size={10} /> 100%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Block (Square & Brutalist) */}
            {totalPages > 1 && (
              <div className="mt-8 mb-8 flex items-center justify-center gap-1 select-none">
                {currentPage > 1 ? (
                  <Link
                    href={`/pornstars/${star.slug}?page=${currentPage - 1}`}
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
                      return <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-end justify-center pb-1 text-zinc-600 font-bold tracking-widest text-sm">...</span>;
                    }
                    const isCurrent = currentPage === pageNum;
                    return (
                      <Link
                        key={pageNum}
                        href={`/pornstars/${star.slug}?page=${pageNum}`}
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
                    href={`/pornstars/${star.slug}?page=${currentPage + 1}`}
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
            <Film className="mx-auto text-zinc-800 mb-3" size={40} />
            <div className="text-zinc-500 font-bold tracking-widest uppercase text-xs">
              No videos available for {star.name} yet.
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-12 pb-8 text-center bg-[#050505] mt-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 text-[10px] uppercase tracking-widest text-zinc-600 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition-colors">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-800 hover:text-rose-600 transition-colors">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition-colors">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact Us</Link>
        </div>

        <div className="text-lg tracking-widest mb-3">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-700">Cater</span>
        </div>
        <p className="text-zinc-700 text-[9px] uppercase font-bold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-4">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
        </p>
        <p className="text-zinc-800 text-[9px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}