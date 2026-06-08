import { PrismaClient } from "@prisma/client";
import { Play, User, Flame, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar"; // Import our new client search element

const prisma = new PrismaClient();

// 🚀 THE MAGIC LINE: Tells Vercel to cache this finished HTML page 
// globally for 60 seconds. Zero database reads for users during this window!
export const revalidate = 60;

export default async function Home() {
  // 1. Fetch data simultaneously directly from the database on the server
  // We use "select" to only fetch small data packets (skipping heavy model data weights)
  const [trendingVideos, latestVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      take: 12,
      orderBy: { views: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true }
    }),
    prisma.video.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true }
    }),
    prisma.pornstar.findMany({
      take: 5,
      orderBy: { views: "desc" },
      select: { id: true, name: true, avatarUrl: true, views: true }
    })
  ]);

  const categories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", 
    "MILF", "Teen", "Anal", "Threesome", "Interracial"
  ];

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
            <button className="flex items-center gap-2 hover:text-white text-zinc-400 transition duration-300 font-light">
              <User size={18} strokeWidth={1.5} /> Login
            </button>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {trendingVideos.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="group block cursor-pointer">
              <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">{video.duration}</div>
                <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">4K</div>
              </div>
              <div className="mt-3 px-1">
                <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">{video.title}</h4>
                <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">{Number(video.views || 0).toLocaleString()} views</p>
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
              <h3 className="text-2xl font-serif italic text-white tracking-wide">Latest Porn Videos</h3>
            </div>
            <Link href="/videos/latest" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">View Directory</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {latestVideos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`} className="group block cursor-pointer">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">{video.duration}</div>
                  <div className="absolute top-2 left-2 border border-rose-800/50 bg-rose-900/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-rose-100">NEW</div>
                </div>
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">{video.title}</h4>
                  <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">{Number(video.views || 0).toLocaleString()} views</p>
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
          <Link href="/pornstars" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">View All Pornstars</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {topPornstars.map((star) => (
            <Link key={star.id} href={`/pornstars/${star.id}`} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]">
              <img src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0" />
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

      {/* Footer */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
        <h2 className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </h2>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">© 2026 • Exclusive Adult Cinema • 18+ Only</p>
      </footer>
    </div>
  );
}