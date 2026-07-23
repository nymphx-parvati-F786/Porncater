// src/components/ui/SmartHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 🔥 IMPORTED TO TRACK CURRENT PAGE
import { 
  Menu, Search, Video, MonitorPlay, TrendingUp, 
  Clock, Star, Sparkles, Filter, ChevronDown 
} from "lucide-react";
import SearchBar from "@/src/components/ui/SearchBar";

export default function SmartHeader({ categories }: { categories: string[] }) {
  const [isHidden, setIsHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(104); // Default safe fallback
  
  const headerRef = useRef<HTMLHeadingElement>(null);
  const accumulatedScroll = useRef(0);
  const lastY = useRef(0);

  // 🔥 Track the current URL path
  const pathname = usePathname();

  // 🔥 Helper to check if a link is the active page
  const checkActive = (path: string) => {
    if (path === "/") return pathname === "/"; // Exact match for home
    return pathname?.startsWith(path); // Sub-page match for others (e.g. /pornstars/star-name)
  };

  // 🔥 Helper to generate dynamic classes for navbar links
  const getNavClass = (path: string) => {
    const isActive = checkActive(path);
    return `flex items-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${
      isActive 
        ? "text-rose-500 border-rose-600 drop-shadow-md" // ACTIVE: Red text & border
        : "text-zinc-300 border-transparent hover:text-white" // INACTIVE: Zinc text & invisible border
    }`;
  };

  // 1. Measures the exact height of the top header so they stitch together perfectly.
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 2. Rock-solid Scroll Logic (Kills Jitter/Flicker)
  useEffect(() => {
    lastY.current = window.scrollY;
    
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;
      lastY.current = currentY;

      if (currentY < 60) {
        setIsHidden(false);
        accumulatedScroll.current = 0;
        return;
      }

      if ((diff > 0 && accumulatedScroll.current > 0) || (diff < 0 && accumulatedScroll.current < 0)) {
        accumulatedScroll.current += diff;
      } else {
        accumulatedScroll.current = diff;
      }

      if (accumulatedScroll.current > 40) {
        setIsHidden(true);
      } else if (accumulatedScroll.current < -40) {
        setIsHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* =========================================
          🔥 BLOCK 1: MAIN HEADER (ALWAYS STICKY)
          ========================================= */}
      <header 
        ref={headerRef} 
        className="sticky top-0 z-[99999] w-full bg-[#050505] border-white/10"
      >
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

        {/* 2. MIDDLE ROW (🔥 NOW DYNAMIC 🔥) */}
        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className={getNavClass("/")}>
              <MonitorPlay size={18} /> Home
            </Link>
            <Link href="/trending" className={getNavClass("/trending")}>
              <TrendingUp size={18} /> Trending
            </Link>
            <Link href="/latest" className={getNavClass("/latest")}>
              <Clock size={18} /> New Videos
            </Link>
            <Link href="/top-rated" className={getNavClass("/top-rated")}>
              <Star size={18} /> Top Rated
            </Link>
            <Link href="/pornstars" className={getNavClass("/pornstars")}>
              <Sparkles size={18} /> Pornstars
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================
          🔥 BLOCK 2: CATEGORY BAR (SEPARATE BUT STITCHED)
          ========================================= */}
      <div 
        className={`sticky z-[99998] w-full bg-[#111] border-b border-zinc-800 transition-all duration-200 ease-out transform-gpu ${
          isHidden ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
        style={{ 
          top: `${headerHeight}px`,
          transform: isHidden ? "translateY(-100%)" : "translateY(0)" 
        }}
      >
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
    </>
  );
}