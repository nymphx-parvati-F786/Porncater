"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Play, Eye, Film, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PornstarProfile() {
  const params = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  const [star, setStar] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!params || !params.id) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <Loader2 size={32} className="animate-spin text-rose-800 mb-4" />
        Loading Profile...
      </div>
    );
  }

  const starId = params.id as string;

  // Fetch profile and their porn videos dynamically
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch the specific pornstar's bio and stats
        const starRes = await fetch(`/api/pornstars/${params.id}`);
        if (!starRes.ok) throw new Error("Pornstar not found");
        const starData = await starRes.json();
        setStar(starData);

        // 2. Fetch ONLY the videos linked to this exact pornstar ID
        // Notice the ?pornstarId= parameter attached to the URL!
        const videoRes = await fetch(`/api/videos?pornstarId=${starId}`);
        const videoData = await videoRes.json();

        // Update the video grid state
        setVideos(Array.isArray(videoData) ? videoData : videoData.data || []);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfileData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <Loader2 size={32} className="animate-spin text-rose-800 mb-4" />
        Loading Profile...
      </div>
    );
  }

  if (!star) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-light tracking-widest uppercase">
        Pornstar not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-24">
      {/* Cinematic Cover Banner */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-900 overflow-hidden">
        <img
          src={star.coverImage || "/thumbnails/default-banner.png"}
          alt={`${star.name} Cover`}
          className="w-full h-full object-cover opacity-60 grayscale-[30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
      </div>

      {/* Profile Info Section */}
      <div className="max-w-[1400px] mx-auto px-6 relative -mt-24 sm:-mt-32">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-sm overflow-hidden border-4 border-[#050505] bg-zinc-900 shadow-2xl flex-shrink-0">
            <img
              src={star.avatarUrl || star.image}
              alt={star.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 pb-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-serif font-light text-white tracking-wide mb-1">
                  {star.name}
                </h1>
                <p className="text-rose-800 text-[11px] uppercase tracking-widest font-bold">
                  {star.rank || "Featured Performer"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-8 py-3 rounded-sm text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 flex items-center gap-2 ${isFollowing ? "bg-zinc-900 text-zinc-400 border border-zinc-800" : "bg-rose-800 text-white hover:bg-rose-700 shadow-[0_0_15px_rgba(159,18,57,0.3)]"}`}
                >
                  <Heart
                    size={14}
                    className={isFollowing ? "fill-current" : ""}
                  />
                  {isFollowing ? "Subscribed" : "Subscribe"}
                </button>
                <button className="px-4 py-3 rounded-sm bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-white transition-all">
                  <Share2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-8 mt-8 py-4 border-y border-white/5">
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">
                  {videos.length}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                  Porn Videos
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">
                  {star.views ? Number(star.views).toLocaleString() : "0"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                  Total Views
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">
                  {star.subscribers || "0"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                  Subscribers
                </span>
              </div>
            </div>

            {/* Bio & Categories */}
            <div className="mt-6">
              <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-3xl">
                {star.bio || "Performer bio coming soon."}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {star.tags && star.tags.length > 0
                  ? star.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="border border-zinc-800 bg-zinc-900/30 px-3 py-1 text-[9px] tracking-widest uppercase text-zinc-500 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-[1400px] mx-auto px-6 mt-20">
        <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-4">
          <Film className="text-rose-800" size={24} strokeWidth={1.5} />
          <h3 className="text-2xl font-serif italic text-white tracking-wide">
            Porn Videos featuring {star.name}
          </h3>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group block cursor-pointer"
              >
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-rose-900/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 text-white">
                    <Play size={20} className="ml-1" fill="currentColor" />
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {video.duration || "0:00"}
                  </div>
                  <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
                    4K
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />{" "}
                      {video.views ? Number(video.views).toLocaleString() : "0"}
                    </span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span>100% Rating</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 text-center py-20 font-light tracking-widest uppercase">
            No porn videos available for this performer yet.
          </div>
        )}
      </div>
    </div>
  );
}
