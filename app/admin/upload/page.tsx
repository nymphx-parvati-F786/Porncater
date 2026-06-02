"use client";

import { useState, useEffect } from "react";
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";

export default function AdminUpload() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  
  // Updated for Many-to-Many: Now an array of selected IDs
  const [selectedPornstarIds, setSelectedPornstarIds] = useState<string[]>([]);
  const [availablePornstars, setAvailablePornstars] = useState<any[]>([]);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingPornstars, setFetchingPornstars] = useState(true);
  
  const [message, setMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  // Fetch real pornstars from DB on mount to populate the dropdown
  useEffect(() => {
    const loadPornstars = async () => {
      try {
        const res = await fetch("/api/pornstars");
        if (res.ok) {
          const data = await res.json();
          // Safety check in case API returns unexpected format
          setAvailablePornstars(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error("Failed to fetch pornstars for dropdown:", error);
      } finally {
        setFetchingPornstars(false);
      }
    };
    loadPornstars();
  }, []);

  // Handle Multi-Select Dropdown
  const handlePornstarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPornstarIds(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile) {
      setMessage({
        type: "error",
        text: "Please provide both video and thumbnail files.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("duration", duration);
    formData.append("category", category);
    
    // Append array of IDs for the new Many-to-Many schema
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
        setMessage({
          type: "success",
          text: "Porn video uploaded and linked successfully.",
        });
        // Reset form
        setTitle("");
        setDuration("");
        setCategory("");
        setSelectedPornstarIds([]);
        setVideoFile(null);
        setThumbnailFile(null);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred during upload.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans py-16 px-6 selection:bg-rose-900 selection:text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/5 pb-6">
          <h1 className="text-4xl font-serif font-light tracking-wide text-white flex items-center gap-4">
            <UploadCloud className="text-rose-800" size={32} strokeWidth={1.5} />
            Upload <span className="italic text-rose-700">New Video</span>
          </h1>
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest mt-3 font-medium">
            Upload high-resolution porn video directly to the database.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-black border border-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-sm p-8 md:p-12 space-y-8"
        >
          {/* Status Message */}
          {message.text && (
            <div
              className={`p-4 flex items-center gap-3 text-[11px] uppercase tracking-widest border rounded-sm ${message.type === "success" ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-500" : "bg-rose-950/30 border-rose-900/50 text-rose-500"}`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an explicit title..."
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Duration (MM:SS)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 32:15"
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700 tabular-nums"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Primary Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cuckold, Interracial..."
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
              />
            </div>

            {/* Dynamic Pornstar Multi-Select */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                <Users size={12} /> Assign Pornstars (Hold Ctrl/Cmd to multi-select)
              </label>
              
              {fetchingPornstars ? (
                <div className="w-full bg-zinc-900/20 border border-zinc-800 border-dashed py-3 px-4 text-sm text-zinc-600 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Loading Roster...
                </div>
              ) : (
                <select
                  multiple
                  value={selectedPornstarIds}
                  onChange={handlePornstarSelect}
                  className="w-full bg-zinc-900/30 border border-zinc-800 focus:border-rose-800 outline-none p-3 text-sm text-zinc-200 transition-all min-h-[120px]"
                >
                  {availablePornstars.length > 0 ? (
                    availablePornstars.map((star) => (
                      <option key={star.id} value={star.id.toString()} className="py-1">
                        {star.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No pornstars found in database.</option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Custom Video File Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Porn Video File
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300 rounded-sm group">
                <Film
                  className={`mb-3 transition-colors ${videoFile ? "text-rose-700" : "text-zinc-600 group-hover:text-rose-800"}`}
                  size={28}
                  strokeWidth={1.5}
                />
                <span className="text-[11px] uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-zinc-200">
                  {videoFile ? videoFile.name : "Select Video File"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Custom Thumbnail File Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Thumbnail Cover
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300 rounded-sm group">
                <ImageIcon
                  className={`mb-3 transition-colors ${thumbnailFile ? "text-rose-700" : "text-zinc-600 group-hover:text-rose-800"}`}
                  size={28}
                  strokeWidth={1.5}
                />
                <span className="text-[11px] uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-zinc-200">
                  {thumbnailFile ? thumbnailFile.name : "Select Thumbnail"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-800 text-white text-[11px] uppercase tracking-widest py-4 rounded-sm hover:bg-rose-700 transition duration-300 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg shadow-rose-900/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading Video...
                </>
              ) : (
                "Publish to Collection"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}