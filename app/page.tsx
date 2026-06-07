"use client";

import { useState, useEffect } from "react";
import { Search, Play, User, Flame, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [pornstars, setPornstars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch both videos and pornstars dynamically from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, pornstarsRes] = await Promise.all([
          fetch("/api/videos"),
          fetch("/api/pornstars"),
          {
            // This tells Next.js to cache the API response for 60 seconds
            next: { revalidate: 60 }
          }
        ]);

        const videosData = await videosRes.json();
        const pornstarsData = await pornstarsRes.json();

        // SAFTEY CHECK: Ensure we are storing arrays even if the API returns an object or error
        setVideos(
          Array.isArray(videosData)
            ? videosData
            : videosData.data || videosData.videos || [],
        );
        setPornstars(
          Array.isArray(pornstarsData)
            ? pornstarsData
            : pornstarsData.data || pornstarsData.pornstars || [],
        );
      } catch (error) {
        console.error("Failed to load database content");
        setVideos([]);
        setPornstars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    "BBC",
    "Lesbian",
    "Cuckold",
    "Blowjob",
    "Creampie",
    "MILF",
    "Teen",
    "Anal",
    "Threesome",
    "Interracial",
  ];

  // SAFTEY CHECK: Fallback to empty arrays before slicing
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safePornstars = Array.isArray(pornstars) ? pornstars : [];

  // Trending = First 12 videos
  const trendingVideos = safeVideos.slice(0, 12);

  // Latest = Sort by newest first
  const latestVideos = [...safeVideos]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 8);

  // Top Pornstars = Sort by highest views
  const topPornstars = [...safePornstars]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    if (searchTerm.trim() !== "") {
      // Pushes the user to the new search page with the query attached
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <div className="w-12 h-12 border-t-2 border-rose-800 rounded-full animate-spin mb-4"></div>
        Curating Collection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      {/* Navbar */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300"
            >
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link
                href="/"
                className="hover:text-white transition duration-300"
              >
                Home
              </Link>
              <Link
                href="/trending"
                className="hover:text-white transition duration-300"
              >
                Trending
              </Link>
              <Link
                href="/pornstars"
                className="hover:text-white transition duration-300"
              >
                Pornstars
              </Link>
              <Link
                href="/live"
                className="text-rose-700 flex items-center gap-2 transition duration-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span>{" "}
                Live
              </Link>
            </div>
          </div>

          {/* Minimalist Search */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search fantasies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-800 focus:border-rose-800 outline-none py-2 px-2 pl-8 text-sm placeholder-zinc-600 transition-all"
              />
              {/* Make the icon clickable as a submit button too */}
              <button type="submit" className="absolute left-0 top-2.5">
                <Search
                  className="text-zinc-600 group-focus-within:text-rose-800 transition hover:text-rose-600"
                  size={16}
                />
              </button>
            </form>
          </div>

          {/* Auth & Upload */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
            <button className="flex items-center gap-2 hover:text-white text-zinc-400 transition duration-300 font-light">
              <User size={18} strokeWidth={1.5} /> Login
            </button>
            <Link
              href="/admin/upload"
              className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner
      <div className="relative h-[65vh] min-h-[500px] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-black/20 z-10" />
        <img
          src="https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png"
          alt="Premium Content"
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-70"
        />

        <div className="relative z-20 px-8 max-w-[1400px] mx-auto w-full text-left">
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-wide mb-6 leading-tight text-white drop-shadow-lg">
            Indulge in your <br />
            <span className="italic text-rose-700">deepest desires.</span>
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-xl font-light tracking-wide drop-shadow-md">
            Curated premium cinema. Unfiltered, authentic, and exclusively
            yours. Fresh daily.
          </p>
          <button className="bg-rose-800 text-white text-[11px] uppercase tracking-widest px-8 py-3.5 hover:bg-rose-700 transition duration-300 flex items-center gap-3 backdrop-blur-sm border border-rose-800/50">
            Explore Collection <Play size={14} fill="white" />
          </button>
        </div>
      </div> */}

      {/* Categories */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/category/${cat.toLowerCase()}`}
              className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-5 py-2 text-xs tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="text-rose-800" size={24} strokeWidth={1.5} />
          <h3 className="text-2xl font-serif italic text-white tracking-wide">
            Trending Porn Videos
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {trendingVideos.length > 0 ? (
            trendingVideos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
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
                  <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
                    4K
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
            ))
          ) : (
            <p className="text-zinc-600 font-light italic">
              No porn videos currently trending.
            </p>
          )}
        </div>
      </div>

      {/* Latest Uploads */}
      <div className="bg-[#030303] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-zinc-500" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">
                Latest Porn Videos
              </h3>
            </div>
            <Link
              href="/videos/latest"
              className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300"
            >
              View Directory
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {latestVideos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
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
                  <div className="absolute top-2 left-2 border border-rose-800/50 bg-rose-900/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-rose-100">
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
            <h3 className="text-2xl font-serif italic text-white tracking-wide">
              Top Pornstars
            </h3>
          </div>
          <Link
            href="/pornstars"
            className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300"
          >
            View All Pornstars
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {topPornstars.map((star) => (
            <Link
              key={star.id}
              href={`/pornstars/${star.id}`}
              className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]"
            >
              <img
                src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                alt={star.name}
                className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-white font-serif italic text-xl tracking-wide mb-1">
                  {star.name}
                </h4>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <span>{Number(star.views || 0).toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Minimalist Footer */}
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
