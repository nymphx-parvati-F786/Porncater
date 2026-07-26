"use client";

import { useState, useEffect, useRef } from "react";
import {
  UploadCloud, Film, Image as ImageIcon, Loader2,
  CheckCircle2, AlertCircle, Users, Tag, Clock,
  Menu, Search, Video, Sparkles, MonitorPlay, TrendingUp, Filter, Star
} from "lucide-react";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";
import SmartHeader from "@/src/components/ui/SmartHeader";

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

export default function AdminUpload() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");

  // Custom Autocomplete for Pornstars
  const [selectedPornstarIds, setSelectedPornstarIds] = useState<string[]>([]);
  const [availablePornstars, setAvailablePornstars] = useState<any[]>([]);
  const [starSearch, setStarSearch] = useState("");
  const [showStarDropdown, setShowStarDropdown] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingPornstars, setFetchingPornstars] = useState(true);

  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });

  const starInputRef = useRef<HTMLDivElement>(null);

  // Fetch real pornstars on mount
  useEffect(() => {
    const loadPornstars = async () => {
      try {
        const res = await fetch("/api/pornstars");
        if (res.ok) {
          const data = await res.json();
          setAvailablePornstars(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error("Failed to fetch pornstars:", error);
      } finally {
        setFetchingPornstars(false);
      }
    };
    loadPornstars();
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (starInputRef.current && !starInputRef.current.contains(event.target as Node)) {
        setShowStarDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStar = (star: any) => {
    if (!selectedPornstarIds.includes(star.id.toString())) {
      setSelectedPornstarIds([...selectedPornstarIds, star.id.toString()]);
    }
    setStarSearch("");
    setShowStarDropdown(false);
  };

  const handleRemoveStar = (idToRemove: string) => {
    setSelectedPornstarIds(selectedPornstarIds.filter(id => id !== idToRemove));
  };

  const filteredStars = availablePornstars.filter(star =>
    star.name.toLowerCase().includes(starSearch.toLowerCase()) &&
    !selectedPornstarIds.includes(star.id.toString())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile) {
      setMessage({ type: "error", text: "Please provide both video and thumbnail files." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("duration", duration);
    formData.append("tags", tags); // Send comma-separated string to backend
    formData.append("pornstarIds", JSON.stringify(selectedPornstarIds));
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      const res = await fetch("/api/admin/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Video uploaded and linked successfully. Thank you for contributing!" });
        setTitle(""); setDuration(""); setTags(""); setSelectedPornstarIds([]);
        setVideoFile(null); setThumbnailFile(null);
      } else {
        setMessage({ type: "error", text: `Upload Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected network error occurred during upload." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">

      {/* HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* =========================================
          🎬 UPLOAD PORTAL UI
          ========================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">

        <div className="mb-10 text-center">
          <UploadCloud className="text-rose-700 mx-auto mb-4" size={48} strokeWidth={1.5} />
          <h1 className="text-3xl md:text-4xl font-serif italic text-white tracking-wide mb-3">
            Upload a Scene
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-lg mx-auto">
            Share high-quality adult content with millions of viewers. Fill out the details below to publish your video directly to the global feed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-zinc-800 shadow-2xl rounded-sm p-6 md:p-10 flex flex-col gap-8">

          {message.text && (
            <div className={`p-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest border rounded-sm ${message.type === "success" ? "bg-emerald-900/20 border-emerald-900/50 text-emerald-500" : "bg-rose-900/20 border-rose-900/50 text-rose-500"}`}>
              {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-3">
              <Film size={14} className="text-rose-600" /> Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Step Sis Gets Stuck Under The Couch..."
              className="w-full bg-black border border-zinc-800 focus:border-rose-700 outline-none py-3 px-4 text-sm text-white transition-colors placeholder-zinc-700 rounded-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration Input */}
            <div>
              <label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-3">
                <Clock size={14} className="text-rose-600" /> Duration (MM:SS)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15:30"
                className="w-full bg-black border border-zinc-800 focus:border-rose-700 outline-none py-3 px-4 text-sm text-white transition-colors placeholder-zinc-700 font-mono rounded-sm"
                required
              />
            </div>

            {/* Tags Input (Replaced Category) */}
            <div>
              <label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-3">
                <Tag size={14} className="text-rose-600" /> Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. MILF, Interracial, Threesome..."
                className="w-full bg-black border border-zinc-800 focus:border-rose-700 outline-none py-3 px-4 text-sm text-white transition-colors placeholder-zinc-700 rounded-sm"
                required
              />
            </div>
          </div>

          {/* Sexy Pornstar Autocomplete */}
          <div className="relative" ref={starInputRef}>
            <label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-3">
              <Users size={14} className="text-rose-600" /> Featuring Performers
            </label>

            <div className="min-h-[46px] w-full bg-black border border-zinc-800 focus-within:border-rose-700 rounded-sm px-3 py-2 flex flex-wrap gap-2 items-center transition-colors">
              {selectedPornstarIds.map(id => {
                const star = availablePornstars.find(s => s.id.toString() === id);
                return star ? (
                  <span key={id} className="bg-rose-900/30 border border-rose-800 text-rose-300 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm flex items-center gap-1.5">
                    {star.name}
                    <button onClick={() => handleRemoveStar(id)} className="hover:text-white"><AlertCircle size={12} /></button>
                  </span>
                ) : null;
              })}

              <input
                type="text"
                value={starSearch}
                onChange={(e) => {
                  setStarSearch(e.target.value);
                  setShowStarDropdown(true);
                }}
                onFocus={() => setShowStarDropdown(true)}
                placeholder={selectedPornstarIds.length === 0 ? "Search for performers..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-700 min-w-[150px]"
                disabled={fetchingPornstars}
              />
            </div>

            {/* Dropdown Results */}
            {showStarDropdown && starSearch.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-[#111] border border-zinc-800 shadow-2xl max-h-60 overflow-y-auto rounded-sm">
                {filteredStars.length > 0 ? (
                  filteredStars.map(star => (
                    <div
                      key={star.id}
                      onClick={() => handleSelectStar(star)}
                      className="px-4 py-3 hover:bg-rose-900/20 text-sm text-zinc-300 cursor-pointer border-b border-zinc-800/50 last:border-0"
                    >
                      {star.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-zinc-500 italic">No performers found matching "{starSearch}"</div>
                )}
              </div>
            )}
          </div>

          {/* Media Drag & Drop Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

            {/* Video Zone */}
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm cursor-pointer transition-all duration-300 group ${videoFile ? 'bg-rose-900/10 border-rose-700' : 'bg-black border-zinc-800 hover:border-rose-600 hover:bg-zinc-900'}`}>
              <Video className={`mb-3 transition-colors ${videoFile ? "text-rose-500" : "text-zinc-600 group-hover:text-rose-500"}`} size={32} strokeWidth={1.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-white">
                {videoFile ? videoFile.name : "Select Video Source (MP4)"}
              </span>
              {!videoFile && <span className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">Max File Size: 2GB</span>}
              <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" required />
            </label>

            {/* Thumbnail Zone */}
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm cursor-pointer transition-all duration-300 group ${thumbnailFile ? 'bg-rose-900/10 border-rose-700' : 'bg-black border-zinc-800 hover:border-rose-600 hover:bg-zinc-900'}`}>
              <ImageIcon className={`mb-3 transition-colors ${thumbnailFile ? "text-rose-500" : "text-zinc-600 group-hover:text-rose-500"}`} size={32} strokeWidth={1.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-white">
                {thumbnailFile ? thumbnailFile.name : "Select High-Res Thumbnail"}
              </span>
              {!thumbnailFile && <span className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">1280x720 • WEBP, JPG, PNG</span>}
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="hidden" required />
            </label>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-700 text-white text-xs font-bold uppercase tracking-widest py-4 mt-4 rounded-sm hover:bg-rose-600 transition duration-300 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(190,18,60,0.3)]"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Transmitting to Database...</>
            ) : (
              <><UploadCloud size={18} /> Publish Scene</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}