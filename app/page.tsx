"use client";

import { useState, useEffect } from "react";
import { Search, Play, User, TrendingUp, Star, Award } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const categories = [
    "Desi", "Indian", "BBC", "Lesbian", "Blowjob", "Creampie", 
    "MILF", "Teen", "Anal", "Threesome", "Interracial", "Saree"
  ];

  const topPornstars = [
    { id: 1, name: "Sunny Leone", image: "/thumbnails/thmbnl_000007.png", videos: 124, views: "18.2M" },
    { id: 2, name: "Emily Willis", image: "/thumbnails/thmbnl_000005.png", videos: 89, views: "14.7M" },
    { id: 3, name: "Lana Rhoades", image: "/thumbnails/thmbnl_000002.png", videos: 67, views: "22.4M" },
    { id: 4, name: "Mia Malkova", image: "/thumbnails/thmbnl_000008.png", videos: 95, views: "19.8M" },
    { id: 5, name: "Blake Blossom", image: "/thumbnails/thmbnl_0000011.png", videos: 54, views: "9.3M" },
  ];

  const trendingVideos = videos.slice(0, 12);
  const latestVideos = [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading premium content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      
      {/* ==================== SEXY NAVBAR ==================== */}
      <nav className="bg-black/95 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-4xl font-bold tracking-[-2.5px]">
              <span className="text-pink-500">PORN</span>
              <span className="text-white">CATER</span>
            </h1>

            <div className="hidden md:flex items-center gap-9 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-white transition">Discover</a>
              <a href="#" className="hover:text-white transition">Desi</a>
              <a href="#" className="hover:text-white transition">Trending</a>
              <a href="#" className="hover:text-white transition">Pornstars</a>
              <a href="#" className="text-pink-500 font-semibold">Live Now</a>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search desi, BBC, hardcore, pornstars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/70 border border-white/10 focus:border-pink-500/60 rounded-full py-3.5 px-6 pl-14 text-sm placeholder:text-gray-500 transition-all"
              />
              <Search className="absolute left-5 top-4 text-gray-400 group-focus-within:text-pink-400 transition" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-sm transition">
              <User size={17} /> Login
            </button>
            <button className="bg-white text-black px-7 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 active:scale-[0.985] transition flex items-center gap-2">
              Upload Video
            </button>
          </div>
        </div>
      </nav>

      {/* ==================== JAW-DROPPING HERO ==================== */}
      <div className="relative h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image + Overlays */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505] z-20" />
        <img 
          src="/thumbnails/thmbnl_000001.png" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]" 
        />

        <div className="relative z-30 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/10 text-xs tracking-[3px] mb-6 border border-white/20">
            <Award size={14} /> PREMIUM ADULT ENTERTAINMENT
          </div>

          <h2 className="text-7xl md:text-[82px] font-bold tracking-[-5.5px] leading-[0.92] mb-6">
            INDULGE.<br /> 
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DESIRE.
            </span><br /> 
            REPEAT.
          </h2>
          
          <p className="text-xl text-gray-300 max-w-lg mx-auto mb-10">
            Fresh Desi • Hardcore Interracial • Premium International
          </p>

          <button className="group bg-white text-black text-lg px-14 py-4 rounded-2xl font-semibold flex items-center gap-3 mx-auto hover:bg-pink-50 active:scale-[0.985] transition-all">
            <Play size={26} fill="black" className="group-hover:scale-110 transition" /> 
            Start Watching Now
          </button>
        </div>
      </div>

      {/* ==================== CATEGORIES ==================== */}
      <div className="max-w-7xl mx-auto px-8 py-14">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-3xl font-bold tracking-tight">Explore Categories</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <a 
              key={i} 
              href="#" 
              className="px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-pink-500/60 text-sm transition-all active:scale-[0.97]"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* ==================== TRENDING (Premium Cards) ==================== */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-pink-500/10 rounded-xl">
            <TrendingUp className="text-pink-500" size={26} />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">Trending Right Now</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingVideos.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="group block">
              <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-pink-500/40 transition-all duration-300">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.08]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
                  
                  <div className="absolute bottom-3 right-3 bg-black/90 text-[10px] px-2.5 py-1 rounded font-mono tracking-widest">
                    {video.duration}
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-pink-600 text-[10px] px-3 py-0.5 rounded-full font-medium tracking-wider opacity-0 group-hover:opacity-100 transition">
                    HD
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-semibold text-[15px] leading-tight line-clamp-2 tracking-[-0.2px] group-hover:text-pink-400 transition">
                    {video.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-3">
                    {Number(video.views).toLocaleString()} views
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ==================== LATEST UPLOADS ==================== */}
      <div className="max-w-7xl mx-auto px-8 py-16 bg-zinc-950/70 border-y border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold tracking-tight">Latest Uploads</h3>
          <a href="#" className="text-sm text-pink-400 hover:text-pink-300 flex items-center gap-1.5 group">
            View All <span className="group-hover:translate-x-0.5 transition">→</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {latestVideos.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="group block">
              <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-pink-500/40 transition-all">
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.08]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70" />
                  
                  <div className="absolute top-3 left-3 bg-emerald-500 text-[10px] px-3 py-0.5 rounded-full font-medium tracking-wider">NEW</div>
                  <div className="absolute bottom-3 right-3 bg-black/90 text-[10px] px-2.5 py-1 rounded font-mono">{video.duration}</div>
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-[15px] leading-tight line-clamp-2 group-hover:text-pink-400 transition tracking-[-0.2px]">
                    {video.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-3">{Number(video.views).toLocaleString()} views</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ==================== TOP PORNSTARS (Sexier) ==================== */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex items-center justify-between mb-9">
          <div>
            <h3 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Star className="text-pink-500" /> Top Pornstars
            </h3>
            <p className="text-gray-400 text-sm mt-1">Most watched this month</p>
          </div>
          <a href="#" className="text-sm text-pink-400 hover:text-pink-300">Browse All Pornstars →</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {topPornstars.map((star) => (
            <div key={star.id} className="group bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer">
              <div className="relative">
                <img 
                  src={star.image} 
                  alt={star.name} 
                  className="w-full aspect-[16/10.5] object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />
                
                <div className="absolute bottom-0 left-0 p-5">
                  <h4 className="text-white text-2xl font-semibold tracking-[-1px]">{star.name}</h4>
                </div>
              </div>
              <div className="px-5 py-4 flex justify-between text-sm border-t border-white/10">
                <span className="text-gray-400">{star.videos} videos</span>
                <span className="text-pink-400 font-medium">{star.views}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-black border-t border-white/10 py-14 text-center text-gray-500 text-sm">
        © 2026 PornCater.com • Premium Adult Entertainment • 18+ Only
      </footer>
    </div>
  );
}