import { PrismaClient } from "@prisma/client";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";

const prisma = new PrismaClient();

// In Next.js 15, searchParams is passed as a Promise
export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Await the searchParams and figure out what page we are on
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page as string) || 1);

  // 2. Set exactly how many videos you want per page
  const videosPerPage = 20;

  // 3. Fetch the specific slice of videos AND the total count at the exact same time
  // 🔥 SEO & DMCA FIX: Added `where: { status: "PUBLISHED" }` so taken down videos disappear from Trending!
  const [videos, totalVideos] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: { views: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        duration: true,
        views: true,
      },
    }),
    prisma.video.count({
      where: { status: "PUBLISHED" },
    }),
  ]);

  // 4. Calculate total pages
  const totalPages = Math.ceil(totalVideos / videosPerPage);

  // Helper function to build page numbers array (e.g., [1, 2, 3, "...", 10])
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

                
            </div>
          </div>

          <SearchBar />

          {/* Auth */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT WRAPPER */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
          <Flame className="text-rose-800" size={28} strokeWidth={1.5} />
          <h1 className="text-3xl md:text-4xl font-serif italic text-white tracking-wide">
            Trending Videos
          </h1>
          <span className="ml-auto text-zinc-500 text-xs tracking-widest uppercase">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* The Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {videos.length > 0 ? (
            videos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}/${video.slug}`}
                className="group block cursor-pointer"
              >
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {video.duration}
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {video.title}
                  </h4>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2 font-medium">
                    {Number(video.views || 0).toLocaleString()} views
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-zinc-600 col-span-full text-center py-20 font-light tracking-wide">
              No videos found.
            </p>
          )}
        </div>

        {/* === WIDE BANNER AD === */}
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex justify-center mt-8">
          <div className="border border-zinc-800/50 bg-black/40 rounded-sm p-4">
            <iframe
              style={{ backgroundColor: "white" }}
              width="900"
              height="250"
              scrolling="no"
              frameBorder="0"
              // This bypasses the TypeScript check while keeping the lowercase attribute
            {...({ allowtransparency: "true" } as any)}
              marginHeight={0}
              marginWidth={0}
              name="spot_id_10013327"
              src="//a.adtng.com/get/10013327?ata=deviparvatilovemuslimcocks"
              title="Advertisement"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* PAGINATION CONTROLS (The 1, 2, 3 Buttons)                 */}
        {/* ========================================================= */}
        {totalPages > 1 && (
          <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-center gap-2">

            {/* Previous Page Button */}
            {currentPage > 1 ? (
              <Link
                href={`/trending?page=${currentPage - 1}`}
                className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white transition-all rounded-sm mr-2"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-800 rounded-sm mr-2 cursor-not-allowed">
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
                  className={`w-10 h-10 flex items-center justify-center text-xs font-mono transition-all rounded-sm border ${currentPage === pageNum
                      ? "border-rose-800 bg-rose-900/20 text-white"
                      : "border-transparent text-zinc-500 hover:border-zinc-800 hover:text-zinc-300"
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
                className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white transition-all rounded-sm ml-2"
              >
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-800 rounded-sm ml-2 cursor-not-allowed">
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        )}
      </div>
      {/* ⬅️ CRITICAL FIX: The max-w container ends here, BEFORE the footer! */}

      {/* Upgraded Footer with Legal Links (Now spans full width) */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202] mt-16 w-full">
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