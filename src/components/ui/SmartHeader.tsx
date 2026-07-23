// src/components/ui/SmartHeader.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Menu, Search, Video, MonitorPlay, TrendingUp, 
  Clock, Star, Sparkles, Filter, ChevronDown 
} from "lucide-react";
import SearchBar from "@/src/components/ui/SearchBar";

export default function SmartHeader({ categories }: { categories: string[] }) {
  const lastScrollY = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const diff = currentY - lastScrollY.current;
          
          const wrapper = wrapperRef.current;
          const inner = innerRef.current;

          if (wrapper && inner) {
            const barHeight = inner.offsetHeight;

            // 15px threshold to ignore tiny scrollbar stutters
            if (Math.abs(diff) > 15) {
              if (diff > 0 && currentY > 120) {
                // SCROLLING DOWN: Slide it up behind the main header
                wrapper.style.marginTop = `-${barHeight}px`;
                wrapper.style.opacity = '0';
                wrapper.style.pointerEvents = 'none';
              } else if (diff < 0) {
                // SCROLLING UP: Slide it back down
                wrapper.style.marginTop = '0px';
                wrapper.style.opacity = '1';
                wrapper.style.pointerEvents = 'auto';
              }
              lastScrollY.current = currentY;
            }

            // Always snap open at the absolute top of the page
            if (currentY < 50) {
              wrapper.style.marginTop = '0px';
              wrapper.style.opacity = '1';
              wrapper.style.pointerEvents = 'auto';
              lastScrollY.current = currentY;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[99999] flex flex-col w-full shadow-2xl shadow-black/90 bg-[#0a0a0a]">
      
      {/* =========================================
          🔥 MAIN STATIC HEADER (Z-20)
          Solid background ensures the sliding bar is completely hidden when it goes up.
          Must be 'relative' (not absolute!) so it stays in the layout flow.
          ========================================= */}
      <div className="relative z-20 bg-[#050505] border-b border-white/10">
        
        {/* 1. TOP ROW */}
        <div className="max-w-[1600px] w-full mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden text-zinc-400 hover:text-white transition">
              <Menu size={28} />
            </button>
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="md:hidden text-zinc-400 hover:text-white transition">
              <Search size={24} />
            </button>
            <Link href="/admin/upload" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-white/10">
              <Video size={16} /> Upload
            </Link>
            <Link href="/login" className="bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(190,18,60,0.4)]">
              Sign In
            </Link>
          </div>
        </div>

        {/* 2. MIDDLE ROW */}
        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-rose-500 border-b-2 border-rose-600 py-3 text-sm font-bold uppercase tracking-wide drop-shadow-md">
              <MonitorPlay size={18} /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <TrendingUp size={18} /> Trending
            </Link>
            <Link href="/latest" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Clock size={18} /> New Videos
            </Link>
            <Link href="/top-rated" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Star size={18} /> Top Rated
            </Link>
            <Link href="/pornstars" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Sparkles size={18} /> Pornstars
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          🔥 CATEGORY ROW (SLIDING GARAGE DOOR)
          Uses Z-10 so it hides underneath the Z-20 header above.
          ========================================= */}
      <div 
        ref={wrapperRef}
        className="relative z-10 w-full transition-all duration-200 ease-out origin-top"
      >
        <div ref={innerRef} className="w-full bg-[#111] border-b border-zinc-800">
          
          <div className="max-w-[1600px] mx-auto px-2 lg:px-4 py-2 flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-1 text-zinc-400 mr-2 shrink-0 px-2">
              <Filter size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Niches</span>
            </div>
            
            {categories.slice(0, 17).map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.toLowerCase()}`}
                prefetch={false}
                className="whitespace-nowrap bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm shrink-0"
              >
                {cat}
              </Link>
            ))}

            {categories.length > 17 && (
              <details className="relative z-50 group">
                <summary className="list-none flex items-center gap-1 whitespace-nowrap bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                  More <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-200" />
                </summary>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl p-2 flex flex-col gap-1 z-[9999]">
                  {categories.slice(17).map((cat, i) => (
                    <Link
                      key={i}
                      href={`/category/${cat.toLowerCase()}`}
                      prefetch={false}
                      className="text-zinc-300 hover:text-rose-100 hover:bg-white/10 px-3 py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors rounded-sm"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
}