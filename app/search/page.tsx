"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Fetch videos using the 'q' parameter handled by your updated API
        const res = await fetch(`/api/videos?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok) {
          setVideos(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error("Failed to load search results", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setVideos([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <div className="w-12 h-12 border-t-2 border-rose-800 rounded-full animate-spin mb-4"></div>
        Searching Archives...
      </div>
    );
  }

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
            <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-12 border-b border-white/5">
        <div className="flex items-center gap-4 text-rose-800 mb-4">
          <SearchIcon size={28} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-widest font-medium">Search Results</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-light text-white tracking-wide">
          "{query}"
        </h1>
      </div>

      {/* Video Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-8">
          Found {videos.length} matching scenes
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {videos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`} className="group block cursor-pointer">
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
                    <span className="flex items-center gap-1"><Eye size={12}/> {Number(video.views).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-900/10">
            <Clock size={32} className="text-zinc-600 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-serif italic text-white mb-2">No matches found</h3>
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest">
              Try adjusting your search terms or exploring our categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}