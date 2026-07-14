import { PrismaClient } from "@prisma/client";
import { Play, Flame, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar"; 
import { Metadata } from "next";

const prisma = new PrismaClient();

// 🚀 CACHE CONTROL: Global 60-second revalidation (Zero DB reads for concurrent users)
export const revalidate = 60;

// =========================================================
// 🚀 HOMEPAGE SEO ENGINE
// =========================================================
export const metadata: Metadata = {
  title: "PornCater | Free HD Porn Videos & Exclusive Adult Cinema",
  description: "Stream the best free porn videos, premium HD sex movies, and exclusive adult cinema featuring top pornstars on PornCater. Updated daily.",
  keywords: "free porn, HD adult videos, sex movies, pornstars, stream porn, tube site",
  alternates: {
    canonical: "https://porncater.com",
  },
  openGraph: {
    title: "PornCater | Exclusive Adult Cinema",
    description: "Stream the best free HD porn videos and exclusive adult cinema.",
    url: "https://porncater.com",
    siteName: "PornCater",
    type: "website",
  },
};

export default async function Home() {
  const [trendingVideos, latestVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      take: 20,
      orderBy: { views: "desc" },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    }),
    prisma.video.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
    }),
    prisma.pornstar.findMany({
      take: 5,
      orderBy: { views: "desc" },
      select: { id: true, slug: true, name: true, avatarUrl: true, views: true },
    }),
  ]);

  const categories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", 
    "MILF", "Teen", "Anal", "Threesome", "Interracial"
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PornCater",
    alternateName: "Porn Cater",
    url: "https://porncater.com/",
    potentialAction: {
      "@type": "SearchAction",
      "target": "https://porncater.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* 🔥 FIX: Properly injects the JSON-LD schema into the document head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Categories */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <Link key={i} href={`/category/${cat.toLowerCase()}`} className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-5 py-2 text-xs tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm">
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="text-rose-800" size={24} strokeWidth={1.5} />
          <h3 className="text-2xl font-serif italic text-white tracking-wide">Trending Porn Videos</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
          {trendingVideos.map((video, index) => (
            <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} className="group block cursor-pointer">
              <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  // 🔥 FIX: The first 5 videos load instantly (eager) to boost LCP. The rest load lazily.
                  loading={index < 5 ? "eager" : "lazy"}
                  decoding={index < 5 ? "sync" : "async"}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* 🔥 FIX: Highly engaging hover overlay to boost CTR */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="bg-rose-700/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                    <Play size={20} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* 🔥 FIX: Duration re-enabled since the pipeline now provides it */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {video.duration}
                  </div>
                )}
                <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white z-10">
                  HD
                </div>
              </div>
              <div className="mt-3 px-1">
                <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                  {video.title}
                </h4>
                <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
                  {Number(video.views || 0).toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Uploads */}
      <div className="bg-[#030303] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-zinc-500" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">Latest Additions</h3>
            </div>
            <Link href="/videos/latest" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
              View Directory
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {latestVideos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}/${video.slug}`} className="group block cursor-pointer">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-rose-700/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                      <Play size={20} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                      {video.duration}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 border border-rose-800/50 bg-rose-900/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-rose-100 z-10">
                    NEW
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {video.title}
                  </h4>
                  <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
                    {Number(video.views || 0).toLocaleString()} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pornstars Section */}
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide">Top Pornstars</h3>
          </div>
          <Link href="/pornstars" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
            View Directory
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {topPornstars.map((star) => (
            <Link key={star.id} href={`/pornstars/${star.slug}`} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5] shadow-[0_0_15px_rgba(0,0,0,0.4)]">
              <img
                src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                alt={star.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-white font-serif italic text-xl tracking-wide mb-1">{star.name}</h4>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <span>{Number(star.views || 0).toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* === ADVERTISEMENT === */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex justify-center">
        <div className="border border-zinc-800/50 bg-black/30 rounded-sm p-3">
          <iframe
            style={{ backgroundColor: "transparent" }}
            width="315"
            height="300"
            scrolling="no"
            frameBorder="0"
            allowTransparency={true}
            marginHeight={0}
            marginWidth={0}
            name="spot_id_10002484"
            src="//a.adtng.com/get/10002484?ata=deviparvatilovemuslimcocks"
            title="Advertisement"
            loading="lazy"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
        <h2 className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </h2>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
          © 2026 • Exclusive Adult Cinema • 18+ Only
        </p>
      </footer>
    </div>
  );
}