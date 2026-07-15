"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types based on what our API returns
interface VideoSuggestion {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface PornstarSuggestion {
  id: number;
  slug: string;
  name: string;
  avatarUrl: string | null;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [pornstars, setPornstars] = useState<PornstarSuggestion[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🧠 THE CLEVER PART: Debounce the API call
  // This waits 300ms after the user stops typing before hitting the server.
  useEffect(() => {
    if (query.trim().length < 2) {
      setVideos([]);
      setPornstars([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
          setPornstars(data.pornstars || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    // If they type again before 300ms, clear the timer and restart it
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle hitting Enter to go to the main search page
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* The Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-zinc-500" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (videos.length > 0 || pornstars.length > 0) setIsOpen(true) }}
          placeholder="Search videos, categories, or stars..."
          className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-rose-800 focus:bg-black transition-all placeholder:text-zinc-600 font-light tracking-wide"
        />
        {isLoading && (
          <div className="absolute right-3 w-4 h-4 border-t-2 border-rose-800 rounded-full animate-spin"></div>
        )}
      </div>

      {/* The Smart Dropdown */}
      {isOpen && (videos.length > 0 || pornstars.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl overflow-hidden z-50">
          
          {/* Pornstars Section (Shows up first if there is a match) */}
          {pornstars.length > 0 && (
            <div className="border-b border-white/5 pb-2">
              <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-zinc-500 font-medium bg-black/40">
                Models
              </div>
              {pornstars.map((star) => (
                <Link
                  key={star.id}
                  href={`/pornstars/${star.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                    {star.avatarUrl ? (
                      <img src={star.avatarUrl} alt={star.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={14} /></div>
                    )}
                  </div>
                  <span className="text-sm font-light text-zinc-300 group-hover:text-white transition-colors">
                    {star.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="pb-2">
              <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-zinc-500 font-medium bg-black/40">
                Videos
              </div>
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}/${video.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900 transition-colors group"
                >
                  <div className="w-16 h-9 bg-zinc-800 rounded-sm overflow-hidden flex-shrink-0 relative">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-0 right-0 bg-black/80 px-1 text-[8px] text-white">
                      {video.duration}
                    </div>
                  </div>
                  <span className="text-xs font-light text-zinc-400 line-clamp-2 group-hover:text-rose-500 transition-colors leading-relaxed">
                    {video.title}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* See All Results Button */}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setIsOpen(false)}
            className="block w-full px-4 py-3 bg-zinc-900/50 hover:bg-rose-900/20 border-t border-white/5 text-xs text-rose-600 hover:text-white transition-all text-center tracking-widest uppercase flex items-center justify-center gap-2 group"
          >
            See all results for "{query}"
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      )}
    </div>
  );
}