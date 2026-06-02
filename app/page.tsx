"use client";

import { useState, useEffect } from "react";
import { Search, Play, User, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from database
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

  // Top Pornstars (static for now)
  const topPornstars = [
    { id: 1, name: "Sunny Leone", image: "/thumbnails/thmbnl_000007.png", videos: 124, views: "18.2M" },
    { id: 2, name: "Emily Willis", image: "/thumbnails/thmbnl_000005.png", videos: 89, views: "14.7M" },
    { id: 3, name: "Lana Rhoades", image: "/thumbnails/thmbnl_000002.png", videos: 67, views: "22.4M" },
    { id: 4, name: "Mia Malkova", image: "/thumbnails/thmbnl_000008.png", videos: 95, views: "19.8M" },
    { id: 5, name: "Blake Blossom", image: "/thumbnails/thmbnl_0000011.png", videos: 54, views: "9.3M" },
  ];

  // Trending = First 8 videos
  const trendingVideos = videos.slice(0, 12);

  // Latest = Sort by newest first (using createdAt from database)
  const latestVideos = [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading videos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Navbar */}
      <nav className="bg-black/95 backdrop-blur-2xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-4xl font-bold tracking-tighter">
              <span className="text-pink-500">PORN</span>CATER
            </h1>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
              <a href="#" className="hover:text-pink-400 transition">Home</a>
              <a href="#" className="hover:text-pink-400 transition">Desi</a>
              <a href="#" className="hover:text-pink-400 transition">Trending</a>
              <a href="#" className="hover:text-pink-400 transition">Pornstars</a>
              <a href="#" className="text-pink-500 font-semibold">Live</a>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search desi girls, BBC, hardcore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-pink-500 rounded-full py-3.5 px-6 pl-14 text-sm placeholder-gray-500"
              />
              <Search className="absolute left-5 top-4 text-gray-400" size={22} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 hover:border-pink-500 transition">
              <User size={18} /> Login
            </button>
            <button className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-2.5 rounded-full font-semibold hover:scale-[1.02] transition">
              Upload Video
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-[620px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-pink-950/80 to-purple-950/70 z-10" />
        <img 
          src="/thumbnails/thmbnl_000001.png" 
          alt="hero" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        
        <div className="relative z-20 text-center px-6 max-w-5xl">
          <h2 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
            INDULGE YOUR <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DEEPEST FANTASIES</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Premium Desi • Interracial • Hardcore • Fresh Uploads Daily
          </p>
          <button className="bg-white text-black text-lg px-14 py-4 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-3 mx-auto">
            <Play size={32} fill="black" /> Start Watching Now
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h3 className="text-2xl font-semibold mb-6">Explore Categories</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <a key={i} href="#" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-pink-500 px-6 py-3 rounded-full text-sm transition-all hover:scale-105">
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-pink-500" size={28} />
          <h3 className="text-3xl font-bold">Trending Right Now 🔥</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {trendingVideos.length > 0 ? (
            trendingVideos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`} className="group block">
                <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 text-xs rounded font-mono">
                    {video.duration}
                  </div>
                  <div className="absolute top-3 left-3 bg-pink-600 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    HD
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <h4 className="font-semibold text-[15px] line-clamp-2 leading-tight group-hover:text-pink-400 transition">
                    {video.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-2">
                    {Number(video.views).toLocaleString()} views
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">No videos found.</p>
          )}
        </div>
      </div>

      {/* Latest Uploads */}
      <div className="max-w-7xl mx-auto px-8 py-14 bg-zinc-950">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">🆕 Latest Uploads</h3>
          <a href="#" className="text-pink-500 hover:text-pink-400 flex items-center gap-2 text-sm">View All →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {latestVideos.reverse().map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="group block">
              <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800">
                <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover transition-all duration-500 group-hover:scale-110" />
                <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 text-xs rounded font-mono">{video.duration}</div>
                <div className="absolute top-3 left-3 bg-green-600 text-xs px-3 py-1 rounded-full font-medium">NEW</div>
              </div>
              <div className="mt-4 px-1">
                <h4 className="font-semibold text-[15px] line-clamp-2 leading-tight group-hover:text-pink-400 transition">{video.title}</h4>
                <p className="text-gray-400 text-sm mt-2">{Number(video.views).toLocaleString()} views</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Pornstars */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Star className="text-pink-500" /> Top Pornstars
          </h3>
          <a href="#" className="text-pink-500 hover:underline text-sm">View All Pornstars →</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {topPornstars.map((star) => (
            <div key={star.id} className="group bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 hover:border-pink-500/60 transition cursor-pointer">
              <div className="relative">
                <img src={star.image} alt={star.name} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
                <div className="absolute bottom-4 left-4">
                  <h4 className="text-white font-semibold text-xl tracking-tight">{star.name}</h4>
                </div>
              </div>
              <div className="px-4 py-4 flex justify-between text-sm text-gray-400">
                <span>{star.videos} videos</span>
                <span>{star.views} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-black border-t border-zinc-800 py-16 text-center text-gray-500 text-sm">
        © 2026 PornCater.com • All Rights Reserved • 18+ Only
      </footer>
    </div>
  );
}