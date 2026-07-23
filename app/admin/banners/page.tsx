"use client";

import { useState, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  MonitorPlay,
  Target
} from "lucide-react";

export default function AdminBannerUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [campaignId, setCampaignId] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [dimension, setDimension] = useState("970x70");
  const [targetStudios, setTargetStudios] = useState("");
  const [targetCategories, setTargetCategories] = useState("");
  const [weight, setWeight] = useState("10");

  // 🔥 NEW: State for the dynamic Campaign Dropdown
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [fetchingCampaigns, setFetchingCampaigns] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  // 🔥 NEW: Fetch campaigns when the page loads
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await fetch("/api/admin/campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setFetchingCampaigns(false);
      }
    };
    loadCampaigns();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please provide a banner creative file." });
      return;
    }
    if (!campaignId) {
      setMessage({ type: "error", text: "Please select a Campaign from the dropdown." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaignId);
    formData.append("trackingLink", trackingLink);
    formData.append("dimension", dimension);
    formData.append("weight", weight);
    formData.append("targetStudios", targetStudios);
    formData.append("targetCategories", targetCategories);

    try {
      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Banner activated! Bunny URL: ${data.banner.imageUrl}` });
        setFile(null);
        setPreview(null);
        setTrackingLink("");
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred during upload." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans py-16 px-6 selection:bg-rose-900 selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/5 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif font-light tracking-wide text-white flex items-center gap-4">
              <MonitorPlay className="text-rose-800" size={32} strokeWidth={1.5} />
              Ad <span className="italic text-rose-700">Network Engine</span>
            </h1>
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mt-3 font-medium">
              Ingest creatives. Target studios. Auto-convert to WebP.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-black border border-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-sm p-8 md:p-12 space-y-8"
        >
          {message.text && (
            <div className={`p-4 flex items-center gap-3 text-[11px] uppercase tracking-widest border rounded-sm ${message.type === "success" ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-500" : "bg-rose-950/30 border-rose-900/50 text-rose-500"}`}>
              {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT: File Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  Banner Creative (Auto-WebP)
                </label>
                <label className="flex flex-col items-center justify-center w-full min-h-[220px] border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300 rounded-sm group p-4 relative overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="mb-3 text-zinc-600 group-hover:text-rose-800 transition-colors" size={28} strokeWidth={1.5} />
                      <span className="text-[11px] uppercase tracking-widest text-center text-zinc-400 group-hover:text-zinc-200">
                        Select Image File
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                </label>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  Ad Slot Dimension
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['970x70', '300x250', '300x100', '160x600'].map((dim) => (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setDimension(dim)}
                      className={`py-3 text-[11px] uppercase tracking-widest font-semibold rounded-sm transition-all border ${
                        dimension === dim 
                          ? 'bg-rose-950/40 border-rose-800 text-rose-500' 
                          : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {dim}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Data Inputs */}
            <div className="space-y-6">
              
              {/* 🔥 NEW: Dynamic Dropdown */}
              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  <Target size={12} /> Target Campaign
                </label>
                {fetchingCampaigns ? (
                  <div className="w-full bg-zinc-900/30 border border-zinc-800 border-dashed py-3 px-4 text-sm text-zinc-600 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading Campaigns...
                  </div>
                ) : (
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full bg-zinc-900/30 border border-zinc-800 focus:border-rose-800 outline-none p-3 text-sm text-zinc-200 transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a Network Campaign...</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id} className="bg-neutral-900">
                        {camp.sponsor.name} — {camp.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  <LinkIcon size={12} /> Unique Tracking Link
                </label>
                <input
                  type="url"
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  placeholder="https://join.blacked.com/track/..."
                  className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  Target Studios (Comma separated)
                </label>
                <input
                  type="text"
                  value={targetStudios}
                  onChange={(e) => setTargetStudios(e.target.value)}
                  placeholder="Blacked, Vixen"
                  className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Target Categories
                  </label>
                  <input
                    type="text"
                    value={targetCategories}
                    onChange={(e) => setTargetCategories(e.target.value)}
                    placeholder="Anal, POV"
                    className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all placeholder-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Weight (Priority)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-4 text-sm text-zinc-200 transition-all tabular-nums"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-800 text-white text-[11px] uppercase tracking-widest py-4 rounded-sm hover:bg-rose-700 transition duration-300 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg shadow-rose-900/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing & Uploading...
                </>
              ) : (
                "Deploy to Network"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}