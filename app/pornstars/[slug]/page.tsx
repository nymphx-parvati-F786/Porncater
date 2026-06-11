import { PrismaClient } from "@prisma/client";
import { Share2, Play, Eye, Film, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SearchBar from "@/src/components/ui/SearchBar";
import SubscribeButton from "@/src/components/ui/SubscribeButton";

const prisma = new PrismaClient();

interface PageProps {
  // 🚀 FIXED: Interface must expect slug, not id!
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PornstarProfile({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // 🚀 FIXED: Extract the slug directly from the main URL path parameter
  const starSlug = resolvedParams.slug;
  if (!starSlug) return notFound();

  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const videosPerPage = 16;

  // 1. Fetch the pornstar bio first using their unique text slug
  const star = await prisma.pornstar.findUnique({
    where: { slug: starSlug }
  });

  if (!star) return notFound();

  // 2. Now that we have the valid star object, use star.id to pull their videos concurrently
  const [videos, totalVideos] = await Promise.all([
    prisma.video.findMany({
      where: {
        pornstars: {
          some: { id: star.id } // Scans relational table mapping using the verified ID
        }
      },
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true }
    }),
    prisma.video.count({
      where: {
        pornstars: {
          some: { id: star.id }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(totalVideos / videosPerPage);

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-24">
      {/* Navbar */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl tracking-widest hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
              <Link href="/live" className="text-rose-700 flex items-center gap-2 transition duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span> Live
              </Link>
            </div>
          </div>

          <SearchBar />

          <div className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Info Section */}
      <div className="max-w-[1400px] mx-auto px-6 relative mt-8 sm:mt-12">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-sm overflow-hidden border-4 border-[#050505] bg-zinc-900 shadow-2xl flex-shrink-0">
            <img
              src={star.avatarUrl || "/thumbnails/default-avatar.png"}
              alt={star.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 pb-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-serif font-light text-white tracking-wide mb-1">
                  {star.name}
                </h1>
                <p className="text-rose-800 text-[11px] uppercase tracking-widest font-bold">
                  {"Featured Performer"}
                </p>
              </div>

              <div className="flex gap-3">
                <SubscribeButton />
                <button className="px-4 py-3 rounded-sm bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-white transition-all">
                  <Share2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-8 mt-8 py-4 border-y border-white/5">
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">{totalVideos}</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Porn Videos</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">
                  {star.views ? Number(star.views).toLocaleString() : "0"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Total Views</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">{star.subscribers || "0"}</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Subscribers</span>
              </div>
            </div>

            {/* Bio & Categories */}
            <div className="mt-6">
              <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-3xl">
                {star.bio || "Performer bio coming soon."}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {star.tags?.map((tag: string, i: number) => (
                  <span key={i} className="border border-zinc-800 bg-zinc-900/30 px-3 py-1 text-[9px] tracking-widest uppercase text-zinc-500 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-[1400px] mx-auto px-6 mt-20">
        <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-4">
          <Film className="text-rose-800" size={24} strokeWidth={1.5} />
          <h3 className="text-2xl font-serif italic text-white tracking-wide">
            Porn Videos featuring {star.name}
          </h3>
          <span className="ml-auto text-zinc-500 text-xs tracking-widest uppercase font-mono">
            Page {currentPage} / {totalPages || 1}
          </span>
        </div>

        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {videos.map((video) => (
                <Link key={video.id} href={`/watch/${video.id}`} className="group block cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-rose-900/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 text-white">
                      <Play size={20} className="ml-1" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                      {video.duration || "0:00"}
                    </div>
                    <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
                      4K
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {video.views ? Number(video.views).toLocaleString() : "0"}
                      </span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span>100% Rating</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Tube-Style Pagination UI Block */}
            {totalPages > 1 && (
              <div className="mt-24 pt-12 border-t border-zinc-900/60 flex items-center justify-center gap-1.5 select-none">
                {currentPage > 1 ? (
                  /* 🚀 FIXED: Map links back to star.slug so pagination stays on the alphanumeric route path */
                  <Link
                    href={`/pornstars/${star.slug}?page=${currentPage - 1}`}
                    className="h-11 px-4 flex items-center justify-center bg-zinc-900 hover:bg-rose-900/40 text-zinc-300 hover:text-white transition-all duration-200 font-mono text-xs uppercase tracking-wider rounded-sm active:scale-95 shadow-md"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Prev
                  </Link>
                ) : (
                  <div className="h-11 px-4 flex items-center justify-center bg-zinc-950 text-zinc-700 font-mono text-xs uppercase tracking-wider rounded-sm cursor-not-allowed opacity-50 shadow-sm">
                    <ChevronLeft size={16} className="mr-1" /> Prev
                  </div>
                )}

                {generatePagination().map((pageNum, index) => {
                  if (pageNum === "...") {
                    return <span key={`ellipsis-${index}`} className="w-11 h-11 flex items-end justify-center pb-2 text-zinc-600 font-bold tracking-widest text-sm">...</span>;
                  }
                  const isCurrent = currentPage === pageNum;
                  return (
                    <Link
                      key={pageNum}
                      href={`/pornstars/${star.slug}?page=${pageNum}`}
                      className={`w-11 h-11 flex items-center justify-center text-xs font-mono font-bold transition-all duration-150 rounded-sm shadow-md active:scale-95 ${
                        isCurrent
                          ? "bg-rose-800 text-white font-black scale-105 ring-1 ring-rose-600/30 shadow-[0_0_15px_rgba(159,18,57,0.3)] z-10"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {currentPage < totalPages ? (
                  <Link
                    href={`/pornstars/${star.slug}?page=${currentPage + 1}`}
                    className="h-11 px-4 flex items-center justify-center bg-zinc-900 hover:bg-rose-800 text-zinc-300 hover:text-white font-bold transition-all duration-200 font-mono text-xs uppercase tracking-wider rounded-sm active:scale-95 shadow-md"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </Link>
                ) : (
                  <div className="h-11 px-4 flex items-center justify-center bg-zinc-950 text-zinc-700 font-mono text-xs uppercase tracking-wider rounded-sm cursor-not-allowed opacity-50 shadow-sm">
                    Next <ChevronRight size={16} className="ml-1" />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-zinc-500 text-center py-20 font-light tracking-widest uppercase">
            No porn videos available for this performer yet.
          </div>
        )}
      </div>
    </div>
  );
}