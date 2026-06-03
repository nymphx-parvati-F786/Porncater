"use client";

import { useState } from "react";
import {
  UserPlus,
  Image as ImageIcon,
  MonitorUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag
} from "lucide-react";

export default function AdminAddPornstar() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState(""); // Comma separated string for easy entry
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile || !coverFile) {
      setMessage({
        type: "error",
        text: "Please provide both an avatar and a cover image.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    // Clean up tags (split by comma, trim whitespace)
    const tagsArray = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("tags", JSON.stringify(tagsArray));
    
    formData.append("avatar", avatarFile);
    formData.append("cover", coverFile);

    try {
      const res = await fetch("/api/admin/add-pornstar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Pornstar profile created and added to roster.",
        });
        // Reset form
        setName("");
        setBio("");
        setTagsInput("");
        setAvatarFile(null);
        setCoverFile(null);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred during profile creation.",
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
            <UserPlus className="text-rose-800" size={32} strokeWidth={1.5} />
            Add <span className="italic text-rose-700">Pornstar</span>
          </h1>
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest mt-3 font-medium">
            Create a new performer profile with high-resolution imagery.
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
              {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            
            {/* Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Performer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emily Willis"
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Biography / Description
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a captivating bio..."
                rows={4}
                className="w-full bg-zinc-900/30 border border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700 rounded-sm resize-none"
              />
            </div>

            {/* Tags (Comma Separated) */}
            <div>
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                <Tag size={12} /> Performer Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Brunette, Petite, Hardcore (comma separated)"
                className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Square Avatar File Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Square Avatar (Profile Pic)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300 rounded-sm group">
                <ImageIcon
                  className={`mb-3 transition-colors ${avatarFile ? "text-rose-700" : "text-zinc-600 group-hover:text-rose-800"}`}
                  size={28}
                  strokeWidth={1.5}
                />
                <span className="text-[11px] uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-zinc-200">
                  {avatarFile ? avatarFile.name : "Select Avatar Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Wide Cover File Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Wide Cinematic Cover
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300 rounded-sm group">
                <MonitorUp
                  className={`mb-3 transition-colors ${coverFile ? "text-rose-700" : "text-zinc-600 group-hover:text-rose-800"}`}
                  size={28}
                  strokeWidth={1.5}
                />
                <span className="text-[11px] uppercase tracking-widest text-center px-4 text-zinc-400 group-hover:text-zinc-200">
                  {coverFile ? coverFile.name : "Select Cover Banner"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
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
                  <Loader2 size={16} className="animate-spin" /> Creating Profile...
                </>
              ) : (
                "Add Pornstar to Roster"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}