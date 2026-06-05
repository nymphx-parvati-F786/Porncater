"use client";

import { useEffect, useState } from "react";
import { Flame, Heart, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
}

type FilterType = "hot" | "adored" | "all-time";

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("hot");

  useEffect(() => {
    const fetchTrending = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/videos/trending?filter=${activeFilter}`);
    
    // 1. Guard check: only parse JSON if the response status is 200 OK
    if (!res.ok) {
      console.error(`Backend returned status ${res.status}`);
      setVideos([]);
      return;
    }

    // 2. Safely parse the data now
    const data = await res.json();
    setVideos(Array.isArray(data) ? data : (data.data || []));

  } catch (error) {
    console.error("Failed to load trending algorithm", error);
    setVideos([]);
  } finally {
    setLoading(false);
  }
};

    fetchTrending();
  }, [activeFilter]);

  // Visual helper for rank badges
  const getRankBadgeStyles = (index: number) => {
    if (index === 0) return "bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]"; // Gold
    if (index === 1) return "bg-zinc-300/20 text-zinc-300 border-zinc-300/50 shadow-[0_0_15px_rgba(212,212,216,0.2)]"; // Silver
    if (index === 2) return "bg-orange-700/20 text-orange-500 border-orange-700/50 shadow-[0_0_15px_rgba(194,65,12,0.3)]"; // Bronze
    return "bg-black/60 text-zinc-400 border-zinc-800"; // Standard
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* Minimalist Navbar */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl tracking-widest hover:opacity-80 transition duration-300">
            <span className="font-serif italic text-rose-800 pr-1">Porn</span>
            <span className="font-light text-white">Cater</span>
          </Link>
          <div className="flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
            <Link href="/" className="hover:text-white transition duration-300">Home</Link>
            <Link href="/category/desi" className="hover:text-white transition duration-300">BBC</Link>
            <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
          </div>
        </div>
      </nav>

      {/* Leaderboard Header */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-8">
        <div className="flex items-center gap-4 text-rose-800 mb-4">
          <TrendingUp size={28} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-widest font-medium">Global Leaderboard</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-light text-white tracking-wide">
          Trending <span className="italic text-zinc-500 text-4xl">Porn Videos</span>
        </h1>
        <p className="text-zinc-400 mt-6 max-w-2xl font-light tracking-wide">
          The most engaged, highest-velocity scenes on the platform right now. Updated in real-time based on viewer metrics and adoration.
        </p>

        {/* Smart Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-10 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveFilter("hot")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[11px] uppercase tracking-widest transition-all duration-300 ${activeFilter === "hot" ? 'bg-rose-900/20 text-rose-500 border border-rose-800/50' : 'text-zinc-500 hover:text-white border border-transparent'}`}
          >
            <Flame size={14} /> Hot Right Now
          </button>
          <button 
            onClick={() => setActiveFilter("adored")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[11px] uppercase tracking-widest transition-all duration-300 ${activeFilter === "adored" ? 'bg-rose-900/20 text-rose-500 border border-rose-800/50' : 'text-zinc-500 hover:text-white border border-transparent'}`}
          >
            <Heart size={14} /> Most Adored
          </button>
          <button 
            onClick={() => setActiveFilter("all-time")}
            className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[11px] uppercase tracking-widest transition-all duration-300 ${activeFilter === "all-time" ? 'bg-rose-900/20 text-rose-500 border border-rose-800/50' : 'text-zinc-500 hover:text-white border border-transparent'}`}
          >
            <TrendingUp size={14} /> All-Time High
          </button>
        </div>
      </div>

      {/* Video Grid with Rank Badges */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <div className="w-8 h-8 border-t-2 border-rose-800 rounded-full animate-spin mb-4"></div>
            <p className="text-[11px] uppercase tracking-widest">Calculating Metrics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {videos.map((video, index) => (
              <Link key={video.id} href={`/watch/${video.id}`} className="group block cursor-pointer relative mt-3">
                
                {/* Dynamic Rank Badge */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-sm flex items-center justify-center font-serif italic text-sm z-10 border backdrop-blur-md ${getRankBadgeStyles(index)}`}>
                  #{index + 1}
                </div>

                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {video.duration}
                  </div>
                </div>
                
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Eye size={12}/> {Number(video.views).toLocaleString()}</span>
                    {activeFilter !== "all-time" && (
                      <span className="flex items-center gap-1 text-rose-800/80"><Heart size={10} fill="currentColor"/> {Number(video.likes || 0).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}