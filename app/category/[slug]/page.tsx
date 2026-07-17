import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { FolderOpen, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import SearchBar from "@/src/components/ui/SearchBar";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper to format category slugs neatly for user view (e.g., "milf" -> "MILF", "blowjob" -> "Blowjob")
const formatCategoryTitle = (slug: string) => {
  const decoded = decodeURIComponent(slug).toLowerCase();
  if (decoded === "bbc" || decoded === "milf") return decoded.toUpperCase();
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
};

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
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Free ${displayTitle} Porn Videos | PornCater`,
      description: `Stream premium HD ${displayTitle} adult clips and trending scenes.`,
      url: canonicalUrl,
      type: "website",
    },
  };
}

// =========================================================
// 🎬 PRIMARY COMPONENT
// =========================================================
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const slug = resolvedParams.slug;
  const displayTitle = formatCategoryTitle(slug);
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page as string) || 1);
  const videosPerPage = 20;

  // 🔥 FIXED: Added the Prisma.VideoWhereInput type
  const whereClause: Prisma.VideoWhereInput = {
    status: "PUBLISHED", // 🛡️ Now TS knows this is your specific Enum!
    OR: [
      { title: { contains: displayTitle, mode: "insensitive" } },
      { tags: { has: displayTitle.toLowerCase() } }
    ]
  };

  const [videos, totalVideos] = await Promise.all([
    prisma.video.findMany({
      where: whereClause,
      take: videosPerPage,
      skip: (currentPage - 1) * videosPerPage,
      orderBy: { views: "desc" }, // Bring the highest-converting heat to the top row
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
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalVideos / videosPerPage);

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

            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
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

      {/* Main Grid Interface */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
          <FolderOpen className="text-rose-800" size={28} strokeWidth={1.5} />
          <h1 className="text-3xl md:text-4xl font-serif italic text-white tracking-wide">
            {displayTitle} Videos
          </h1>
          <span className="ml-auto text-zinc-500 text-xs tracking-widest uppercase font-mono">
            Page {currentPage} of {totalPages || 1} • {totalVideos} Clips
          </span>
        </div>

        {/* The Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}/${video.slug}`}
                prefetch={false} // 🔥 FIXED: Safely shields database overhead during deep category browsing!
                className="group block cursor-pointer"
              >
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-md">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    priority={index < 8} // Flawless Above-The-Fold LCP rendering optimization
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                  />
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
                    <span className="flex items-center gap-1"><Eye size={12}/> {Number(video.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-zinc-600 col-span-full text-center py-20 font-light tracking-wide">
              No videos matching this category tags found.
            </p>
          )}
        </div>

        {/* Pagination Engine Block */}
        {totalPages > 1 && (
          <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-center gap-2">
            
            {currentPage > 1 ? (
              <Link
                href={`/category/${slug}?page=${currentPage - 1}`}
                className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white transition-all rounded-sm mr-2"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-800 rounded-sm mr-2 cursor-not-allowed">
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
                  href={`/category/${slug}?page=${pageNum}`}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-mono transition-all rounded-sm border ${currentPage === pageNum
                      ? "border-rose-800 bg-rose-900/20 text-white"
                      : "border-transparent text-zinc-500 hover:border-zinc-800 hover:text-zinc-300"
                    }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {currentPage < totalPages ? (
              <Link
                href={`/category/${slug}?page=${currentPage + 1}`}
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

      {/* Footer Element */}
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