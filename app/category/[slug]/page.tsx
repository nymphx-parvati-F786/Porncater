import { PrismaClient } from "@prisma/client";
import { Flame, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SearchBar from "@/src/components/ui/SearchBar";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  // 1. Await incoming parameters from the Next.js runtime stream
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const rawSlug = resolvedParams.slug || "";
  if (!rawSlug) return notFound();

  // Re-stitch slug to display clean tag headings (e.g., "big-tits" -> "Big Tits")
  const categoryName = rawSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // 2. Parse Sort and Page controls from the URL query
  const currentSort = resolvedSearchParams.sort === "views" ? "views" : "latest";
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const videosPerPage = 20;

  // Set Prisma sorting condition mapping
  const orderByCondition = currentSort === "views"
    ? { views: "desc" as const }
    : { createdAt: "desc" as const };

  // 3. Query DB via Promise.all to fetch the specific slice and counts simultaneously
  const [videos, totalVideos] = await Promise.all([
    prisma.video.findMany({
      where: {
        tags: {
          has: categoryName // Scans string array field for tag value match
        }
      },
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: orderByCondition,
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true }
    }),
    prisma.video.count({
      where: {
        tags: {
          has: categoryName
        }
      }
    })
  ]);

  const totalPages = Math.ceil(totalVideos / videosPerPage);

  // Elite tube pagination logic engine
  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">

      {/* Navbar */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
              <Link href="/live" className="text-rose-700 flex items-center gap-2 transition duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span> Live
              </Link>
            </div>
          </div>

          {/* Render the extracted interactive search element */}
          <SearchBar />

          {/* Auth */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
            {/*<button className="flex items-center gap-2 hover:text-white text-zinc-400 transition duration-300 font-light">
              <User size={18} strokeWidth={1.5} /> Login
            </button>*/}
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* Category Header */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-12 border-b border-white/5">
        <div className="flex items-center gap-4 text-rose-800 mb-4">
          <Flame size={28} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-widest font-medium">Exclusive Category</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-light text-white tracking-wide">
          {categoryName} <span className="italic text-zinc-500 text-4xl">Porn Videos</span>
        </h1>
        <p className="text-zinc-400 mt-6 max-w-2xl font-light tracking-wide">
          Browse our premium collection of {categoryName.toLowerCase()} scenes. High-definition, unfiltered, and updated daily for your viewing pleasure.
        </p>
      </div>

      {/* Video Content Controller Deck */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12 border-b border-zinc-900 pb-4">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
            Showing {videos.length} of {totalVideos} Scenes
          </div>

          {/* 🔥 PREMIUM TUBE-STYLE FILTER TOGGLES */}
          <div className="flex gap-6 text-[11px] uppercase tracking-widest font-bold">
            <Link
              href={`/category/${rawSlug}?sort=latest`}
              className={`pb-2 transition-colors relative ${currentSort === "latest" ? "text-rose-500 font-black" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Newest
              {currentSort === "latest" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]" />}
            </Link>
            <Link
              href={`/category/${rawSlug}?sort=views`}
              className={`pb-2 transition-colors relative ${currentSort === "views" ? "text-rose-500 font-black" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Most Viewed
              {currentSort === "views" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]" />}
            </Link>
          </div>
        </div>

        {/* Video Response Matrix */}
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {videos.map((video) => (
                <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} className="group block cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
                      HD
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Eye size={12} /> {Number(video.views).toLocaleString()} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 🔥 HIGH-CONTRAST CHUNKY PAGINATION BLOCK */}
            {totalPages > 1 && (
              <div className="mt-24 pt-12 border-t border-zinc-900/60 flex items-center justify-center gap-1.5 select-none">
                {currentPage > 1 ? (
                  <Link
                    href={`/category/${rawSlug}?sort=${currentSort}&page=${currentPage - 1}`}
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
                      href={`/category/${rawSlug}?sort=${currentSort}&page=${pageNum}`}
                      className={`w-11 h-11 flex items-center justify-center text-xs font-mono font-bold transition-all duration-150 rounded-sm shadow-md active:scale-95 ${isCurrent
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
                    href={`/category/${rawSlug}?sort=${currentSort}&page=${currentPage + 1}`}
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
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-900/10">
            <Clock size={32} className="text-zinc-600 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-serif italic text-white mb-2">No scenes found</h3>
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest">
              We are currently curating more {categoryName} content. Check back soon.
            </p>
          </div>
        )}
      </div>

      {/* Upgraded Footer with Legal Links */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
          <Link href="/dmca" className="hover:text-white transition duration-300">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-white transition duration-300">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition duration-300">Terms of Service</Link>
          <Link href="/2257" className="hover:text-white transition duration-300">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-white transition duration-300">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-2xl mx-auto px-6 leading-relaxed mb-4">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
        </p>
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} • Exclusive Adult Cinema • 18+ Only
        </p>
      </footer>
    </div>
  );
}