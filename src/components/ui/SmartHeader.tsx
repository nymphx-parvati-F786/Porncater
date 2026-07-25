// src/components/ui/SmartHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, Search, Video, MonitorPlay, TrendingUp,
  Clock, Star, Sparkles, Filter, ChevronDown, X
} from "lucide-react";
import SearchBar from "@/src/components/ui/SearchBar";

export default function SmartHeader({ categories }: { categories: string[] }) {
  const [headerHeight, setHeaderHeight] = useState(104);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const headerRef = useRef<HTMLHeadingElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);

  const accumulatedScroll = useRef(0);
  const lastY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const checkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const getNavClass = (path: string) => {
    const isActive = checkActive(path);
    return `flex items-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${isActive
      ? "text-rose-500 border-rose-600 drop-shadow-md"
      : "text-zinc-300 border-transparent hover:text-white"
      }`;
  };

  const getMobileNavClass = (path: string) => {
    const isActive = checkActive(path);
    return `flex items-center gap-4 py-4 text-lg font-bold uppercase tracking-widest border-b border-white/5 transition-colors ${isActive
      ? "text-rose-500"
      : "text-zinc-300 hover:text-white"
      }`;
  };

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isMobileSearchOpen]);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const diff = currentY - lastY.current;
          lastY.current = currentY;
          const bar = categoryBarRef.current;

          if (bar) {
            if (currentY < 60) {
              bar.style.transform = "translateY(0)";
              bar.style.opacity = "1";
              bar.style.pointerEvents = "auto";
              accumulatedScroll.current = 0;
              ticking = false;
              return;
            }

            if ((diff > 0 && accumulatedScroll.current > 0) || (diff < 0 && accumulatedScroll.current < 0)) {
              accumulatedScroll.current += diff;
            } else {
              accumulatedScroll.current = diff;
            }

            if (accumulatedScroll.current > 40) {
              bar.style.transform = "translateY(-100%)";
              bar.style.opacity = "0";
              bar.style.pointerEvents = "none";
            } else if (accumulatedScroll.current < -40) {
              bar.style.transform = "translateY(0)";
              bar.style.opacity = "1";
              bar.style.pointerEvents = "auto";
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

  // ========================================================================
  // 🔥 DYNAMIC VISIBILITY LOGIC (ZERO JS OVERHEAD, PURE CSS BREAKPOINTS)
  // ========================================================================
  const getMainVisibilityClass = (index: number) => {
    if (index < 2) return "flex";                     // Always visible (Mobile shows 2)
    if (index < 5) return "hidden sm:flex";           // Tablet Portrait shows 5
    if (index < 8) return "hidden md:flex";           // Tablet Landscape shows 8
    if (index < 12) return "hidden lg:flex";          // Small Desktop shows 12
    if (index < 17) return "hidden xl:flex";          // Large Desktop shows 17
    return "hidden";                                  // Never in main bar
  };

  const getDropdownVisibilityClass = (index: number) => {
    if (index < 2) return "hidden";                   // Never in dropdown
    if (index < 5) return "flex sm:hidden";           // In dropdown on mobile, hidden on tablet+
    if (index < 8) return "flex md:hidden";           // In dropdown up to md, hidden on md+
    if (index < 12) return "flex lg:hidden";          // In dropdown up to lg, hidden on lg+
    if (index < 17) return "flex xl:hidden";          // In dropdown up to xl, hidden on xl+
    return "flex";                                    // Always in dropdown
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-[99999] w-full bg-[#050505] border-white/10">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
              className="lg:hidden text-zinc-400 hover:text-white transition"
            >
              <Menu size={28} aria-hidden="true" />
            </button>
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          {/* =========================================
              🔥 RIGHT SIDE: UPLOAD & SEARCH
              ========================================= */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">

            {/* 🚀 SEXY MOBILE-READY UPLOAD BUTTON */}
            <Link
              href="/admin/upload"
              className="flex items-center gap-1.5 sm:gap-2 bg-rose-900/20 hover:bg-rose-900/40 sm:bg-white/5 sm:hover:bg-white/10 text-rose-500 sm:text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border border-rose-900/50 sm:border-white/10 shadow-[0_0_10px_rgba(190,18,60,0.15)] sm:shadow-none group"
            >
              <Video size={16} className="group-hover:scale-110 transition-transform" />
              {/* Text hides ONLY on ultra-tiny screens (< 360px), stays visible on standard modern phones */}
              <span className="hidden min-[360px]:block">Upload</span>
            </Link>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Toggle Mobile Search"
              className="md:hidden text-zinc-400 hover:text-white transition p-1"
            >
              {isMobileSearchOpen ? <X size={24} aria-hidden="true" /> : <Search size={24} aria-hidden="true" />}
            </button>

          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden w-full px-4 py-3 bg-[#111] border-t border-zinc-900 animate-in slide-in-from-top-2 duration-200">
            <SearchBar />
          </div>
        )}

        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className={getNavClass("/")}><MonitorPlay size={18} /> Home</Link>
            <Link href="/trending" className={getNavClass("/trending")}><TrendingUp size={18} /> Trending</Link>
            <Link href="/latest" className={getNavClass("/latest")}><Clock size={18} /> New Videos</Link>
            <Link href="/top-rated" className={getNavClass("/top-rated")}><Star size={18} /> Top Rated</Link>
            <Link href="/pornstars" className={getNavClass("/pornstars")}><Sparkles size={18} /> Pornstars</Link>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100000] bg-[#050505] flex flex-col overflow-y-auto animate-in slide-in-from-left-full duration-300">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <Link href="/" className="text-3xl tracking-widest cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white p-2"
            >
              <X size={32} />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8">
            <Link href="/" className={getMobileNavClass("/")}><MonitorPlay size={20} /> Home</Link>
            <Link href="/trending" className={getMobileNavClass("/trending")}><TrendingUp size={20} /> Trending</Link>
            <Link href="/latest" className={getMobileNavClass("/latest")}><Clock size={20} /> New Videos</Link>
            <Link href="/top-rated" className={getMobileNavClass("/top-rated")}><Star size={20} /> Top Rated</Link>
            <Link href="/pornstars" className={getMobileNavClass("/pornstars")}><Sparkles size={20} /> Pornstars</Link>

            <div className="mt-8 pt-8 border-t border-white/5">
              <Link href="/admin/upload" className="flex items-center justify-center gap-2 bg-rose-900/20 text-rose-500 border border-rose-900/50 px-4 py-4 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors w-full">
                <Video size={18} /> Upload Video
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* ========================================================================
          🔥 SMART SINGLE-LEVEL CATEGORY BAR
          ======================================================================== */}
      <div
        ref={categoryBarRef}
        className="sticky z-[99998] w-full bg-[#111] border-b border-zinc-800 transition-transform duration-200 ease-out transform-gpu opacity-100 pointer-events-auto"
        style={{
          top: `${headerHeight}px`,
          transform: "translateY(0)"
        }}
      >
        <div className="max-w-[1600px] mx-auto px-2 lg:px-4 py-2 flex items-center flex-wrap gap-2">

          {/* Static Niches Label */}
          <div className="flex items-center gap-1 text-zinc-400 mr-1 shrink-0 px-1">
            <Filter size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Niches</span>
          </div>

          {/* Dynamic Main Bar Rendering */}
          {categories.map((cat, i) => {
            const visibilityClass = getMainVisibilityClass(i);
            if (visibilityClass === "hidden") return null;

            return (
              <Link
                key={`main-${i}`}
                href={`/category/${cat.toLowerCase()}`}
                prefetch={false}
                className={`${visibilityClass} items-center justify-center whitespace-nowrap bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm shrink-0`}
              >
                {cat}
              </Link>
            );
          })}

          {/* Dynamic "More" Dropdown */}
          <details className="relative z-50 group shrink-0">
            <summary className="list-none flex items-center gap-1 whitespace-nowrap bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm cursor-pointer select-none [&::-webkit-details-marker]:hidden">
              More <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-200" />
            </summary>

            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl p-2 flex flex-col gap-1 z-[9999]">
              {categories.map((cat, i) => {
                const dropVisibilityClass = getDropdownVisibilityClass(i);
                if (dropVisibilityClass === "hidden") return null;

                return (
                  <Link
                    key={`drop-${i}`}
                    href={`/category/${cat.toLowerCase()}`}
                    prefetch={false}
                    className={`${dropVisibilityClass} items-center text-zinc-300 hover:text-rose-100 hover:bg-white/10 px-3 py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors rounded-sm`}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </details>

        </div>
      </div>
    </>
  );
}