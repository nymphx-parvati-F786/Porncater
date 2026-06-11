import { PrismaClient } from "@prisma/client";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";
import PornstarSearchFilter from "@/src/components/ui/PornstarSearchFilter";

const prisma = new PrismaClient();

interface DirectoryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PornstarsDirectory({ searchParams }: DirectoryProps) {
  const resolvedSearchParams = await searchParams;
  
  const searchQuery = (resolvedSearchParams.search as string) || "";
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const performersPerPage = 20;

  // 1. Build dynamic Prisma database query conditions based on URL search query parameter
  const queryCondition = searchQuery
    ? { name: { contains: searchQuery, mode: "insensitive" as const } }
    : {};

  // 2. Concurrently pull total counts and limited page rows from database
  const [pornstars, totalPerformers] = await Promise.all([
    prisma.pornstar.findMany({
      where: queryCondition,
      take: performersPerPage,
      skip: (currentPage - 1) * performersPerPage,
      orderBy: { views: "desc" },
      include: {
        _count: {
          select: { videos: true }
        }
      }
    }),
    prisma.pornstar.count({ where: queryCondition })
  ]);

  const totalPages = Math.ceil(totalPerformers / performersPerPage);

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
              <Link href="/live" className="text-rose-700 flex items-center gap-2 transition duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span> Live
              </Link>
            </div>
          </div>

          <SearchBar />

          <div className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300">
              Upload
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Directory Header */}
      <div className="relative border-b border-white/5 bg-black py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-white mb-4">
            Top <span className="italic text-rose-800">Pornstars</span>
          </h1>
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest font-medium max-w-2xl">
            Browse our exclusive collection of the most viewed and highest-rated pornstars in the industry.
          </p>

          <PornstarSearchFilter initialQuery={searchQuery} />
        </div>
      </div>

      {/* Pornstars Grid */}
      <div className="max-w-[1400px] mx-auto px-6 pt-12">
        {pornstars.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
              {pornstars.map((star, index) => {
                // Calculate position relative to total page positioning
                const globalRank = (currentPage - 1) * performersPerPage + (index + 1);
                
                return (
                  /* 🚀 KEY CHANGE: We drop star.id and map explicitly to the unique string URL slug field! */
                  <Link 
                    key={star.id} 
                    href={`/pornstars/${star.slug}`} 
                    className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[2/3]"
                  >
                    <img 
                      src={star.avatarUrl || "/thumbnails/default-avatar.png"} 
                      alt={star.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-xl z-10 font-mono">
                      #{globalRank}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <h4 className="text-white font-serif italic text-2xl tracking-wide mb-2 drop-shadow-md">{star.name}</h4>
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                        <span className="flex items-center gap-1.5">
                          <Star size={10} className="text-rose-600" fill="currentColor"/> 
                          {star._count?.videos || 0} Videos
                        </span>
                        <span>{star.views ? Number(star.views).toLocaleString() : '0'} Views</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Premium Tube Pagination Block */}
            {totalPages > 1 && (
              <div className="mt-24 pt-12 border-t border-zinc-900/60 flex items-center justify-center gap-1.5 select-none">
                {currentPage > 1 ? (
                  <Link
                    href={`/pornstars?search=${searchQuery}&page=${currentPage - 1}`}
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
                      href={`/pornstars?search=${searchQuery}&page=${pageNum}`}
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
                    href={`/pornstars?search=${searchQuery}&page=${currentPage + 1}`}
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
            No pornstars found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
}