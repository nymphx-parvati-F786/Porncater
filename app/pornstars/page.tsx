'use client';

import { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SearchBar from "@/src/components/ui/SearchBar";

export default function PornstarsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pornstars, setPornstars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all pornstars from the database
  useEffect(() => {
    const fetchPornstars = async () => {
      try {
        const res = await fetch('/api/pornstars',{ cache: 'no-store' });
        const data = await res.json();
        setPornstars(data);
      } catch (error) {
        console.error("Failed to load pornstars");
      } finally {
        setLoading(false);
      }
    };

    fetchPornstars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <Loader2 size={32} className="animate-spin text-rose-800 mb-4" />
        Curating Directory...
      </div>
    );
  }

  // Filter based on search input
  const filteredPornstars = pornstars.filter((star) => 
    star.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-24">

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
              {/* <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link> */}
              <Link href="/live" className="text-rose-700 flex items-center gap-2 transition duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span> Live
              </Link>
            </div>
          </div>

          {/* Render the extracted interactive search element */}
          <SearchBar />

          {/* Auth */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
           {/*<button className="flex items-center gap-2 hover:text-white text-zinc-400 transition duration-300 font-light">
              <User size={18} strokeWidth={1.5} /> Login
            </button>*/}
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
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

          {/* Filters & Search */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative group w-full sm:w-96">
              <input
                type="text"
                placeholder="Search pornstars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-2 pl-8 text-sm text-zinc-200 transition-all placeholder-zinc-700"
              />
              <Search className="absolute left-0 top-3 text-zinc-600 group-focus-within:text-rose-800 transition" size={18} />
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <button className="flex items-center gap-2 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 px-5 py-2.5 text-[10px] tracking-widest uppercase text-zinc-400 transition-all duration-300 rounded-sm">
                <TrendingUp size={14} /> Trending
              </button>
              <button className="flex items-center gap-2 border border-zinc-800 hover:border-white/30 bg-zinc-900/30 px-5 py-2.5 text-[10px] tracking-widest uppercase text-zinc-400 transition-all duration-300 rounded-sm">
                <Filter size={14} /> Filter A-Z
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pornstars Grid */}
      <div className="max-w-[1400px] mx-auto px-6 pt-12">
        {filteredPornstars.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
            {filteredPornstars.map((star, index) => (
              <Link key={star.id} href={`/pornstars/${star.id}`} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[2/3]">
                {/* Note: Ensure 'star.image' contains the full Bunny.net URL from your DB */}
                <img 
                  src={star.avatarUrl} 
                  alt={star.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Dynamic Rank (Optional based on index or DB sorting) */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-xl z-10">
                  #{index + 1}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h4 className="text-white font-serif italic text-2xl tracking-wide mb-2 drop-shadow-md">{star.name}</h4>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span className="flex items-center gap-1.5"><Star size={10} className="text-rose-600" fill="currentColor"/> {star.videoCount || 0} Porn Videos</span>
                    <span>{star.views ? Number(star.views).toLocaleString() : '0'} Views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 text-center py-20 font-light tracking-widest uppercase">
            No pornstars found.
          </div>
        )}
      </div>
    </div>
  );
}