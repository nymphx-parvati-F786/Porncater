"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  Download,
  Sparkles,
  Film,
  Eye,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import AdSpace from "@/src/components/ui/ads/AdSpace";

interface Pornstar {
  id: number;
  name: string;
  avatarUrl: string;
  views: number;
  _count?: { videos: number };
}

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  videoUrl: string;
  createdAt: string;
  tags: string[];
  pornstars: Pornstar[];
}

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [topPornstars, setTopPornstars] = useState<Pornstar[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);


  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // 1. Fetch current video
        const videoRes = await fetch(`/api/videos/${id}`);
        if (videoRes.ok) {
          const videoData = await videoRes.json();
          setVideo(videoData);

          // 2. THE RABBIT HOLE ENGINE: Fetch smart related videos
          // This hits our new API which returns highly targeted, addictive recommendations 
          // based on the current scene's tags and pornstars.
          const relatedRes = await fetch(`/api/videos/${id}/related`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedVideos(Array.isArray(relatedData) ? relatedData : []);
          } else {
            setRelatedVideos([]);
          }

          // 3. Fetch top pornstars for the bottom section
          const pornstarsRes = await fetch("/api/pornstars");
          const pornstarsData = await pornstarsRes.json();
          const safePornstars = Array.isArray(pornstarsData)
            ? pornstarsData
            : pornstarsData.data || [];

          // Sort by views and take top 5
          const sortedPornstars = safePornstars
            .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
          setTopPornstars(sortedPornstars);

        } else {
          setVideo(null);
        }
      } catch (err) {
        console.error("Failed to load Watch Page data", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  // Place this inside your WatchPage component, right below your data loading useEffect
  useEffect(() => {
    // If video hasn't loaded yet, do nothing
    if (!video) return;

    // Set a 5-second retention timer before counting a true "view"
    const viewTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/videos/${video.id}/view`, {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          // Optimistically update frontend view state so the number ticks up live for the user
          setVideo((prev) => (prev ? { ...prev, views: data.views } : null));
          console.log(
            `🎯 Retention metric logged. Current views: ${data.views}`,
          );
        }
      } catch (err) {
        console.error("View counter ping failed:", err);
      }
    }, 5000); // 5000 milliseconds = 5 seconds

    // CLEANUP: If the user closes the tab or clicks away within 5 seconds, clear the timer
    return () => clearTimeout(viewTimer);
  }, [video?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase text-sm">
        <div className="w-12 h-12 border-t-2 border-rose-800 rounded-full animate-spin mb-4"></div>
        Preparing Scene...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-light tracking-widest uppercase">
        <p className="mb-4">Scene not found or removed.</p>
        <button
          onClick={() => router.push("/")}
          className="text-rose-800 hover:text-rose-600 transition underline underline-offset-4"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Format the date
  const uploadDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "Recently Uploaded";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      {/* Navbar: Elegant Frosted Glass */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="text-3xl tracking-widest hover:opacity-80 transition duration-300"
            >
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link
                href="/"
                className="hover:text-white transition duration-300"
              >
                Home
              </Link>
              <Link
                href="/category/desi"
                className="hover:text-white transition duration-300"
              >
                Desi
              </Link>
              <Link
                href="/trending"
                className="hover:text-white transition duration-300"
              >
                Trending
              </Link>
              <Link
                href="/pornstars"
                className="hover:text-white transition duration-300"
              >
                Pornstars
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-white text-[11px] uppercase tracking-widest transition duration-300">
              Login
            </button>
            <Link
              href="/admin/upload"
              className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: Cinematic Player + Details */}
          <div className="w-full lg:w-[68%]">
            {/* Player Container */}
            <div className="bg-black aspect-video rounded-sm overflow-hidden ring-1 ring-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnail}
                title={video.title}
              />
            </div>

            {/* Video Meta Information */}
            <div className="mt-8 border-b border-white/5 pb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-light text-white leading-tight tracking-wide pr-4">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between mt-6 gap-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                    <span>
                      {Number(video.views || 0).toLocaleString()} views
                    </span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span>{uploadDate}</span>
                  </div>

                  {/* Dynamically list the pornstars featured in this specific video */}
                  {video.pornstars && video.pornstars.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                        Featuring:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {video.pornstars.map((star) => (
                          <Link
                            key={star.id}
                            href={`/pornstars/${star.id}`}
                            className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full pr-3 py-0.5 transition-colors"
                          >
                            <img
                              src={
                                star.avatarUrl ||
                                "/thumbnails/default-avatar.png"
                              }
                              alt={star.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-[10px] text-zinc-300 uppercase tracking-widest">
                              {star.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>


                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      // 1. Optimistically update the UI instantly so it feels lightning fast
                      const newLikedState = !liked;
                      setLiked(newLikedState);

                      // Optional: Optimistically update the total likes number if you are displaying it next to the button
                      // setVideo(prev => prev ? { ...prev, likes: (prev.likes || 0) + (newLikedState ? 1 : -1) } : null);

                      // 2. Fire the network request in the background to update the database
                      try {
                        await fetch(`/api/videos/${video.id}/like`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ isLiking: newLikedState }),
                        });
                      } catch (error) {
                        console.error(
                          "Failed to register like action:",
                          error,
                        );
                        // If it fails, revert the heart icon back
                        setLiked(!newLikedState);
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-sm border transition-all duration-300 text-[11px] uppercase tracking-widest ${liked ? "border-rose-800/50 bg-rose-900/20 text-rose-500" : "border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white"}`}
                  >
                    <Heart
                      className={liked ? "fill-rose-500" : ""}
                      size={16}
                      strokeWidth={1.5}
                    />
                    {liked ? "Liked" : "Like"}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Share2 size={16} strokeWidth={1.5} /> Share
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Download size={16} strokeWidth={1.5} /> Save
                  </button>
                </div>
              </div>

              {/* Dynamic Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-medium">
                    Video Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, i) => (
                      <Link
                        key={i}
                        href={`/category/${tag.toLowerCase()}`}
                        className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-4 py-1.5 text-[10px] tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm cursor-pointer"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* -------------------------------------------------- */}
              {/* NEW HIGH-CTR HORIZONTAL BANNER ZONE (BELOW TAGS)  */}
              {/* -------------------------------------------------- */}
              <AdSpace
                zoneId="5944222"
                format="banner-900x250"
                className="mt-10 pt-4 border-t border-white/5"
              />
            </div>
          </div>

          {/* RIGHT: Up Next Sidebar */}
          <div className="w-full lg:w-[32%]">
            {/* Live ExoClick Banner Space */}
            <AdSpace zoneId="5944198" format="banner-300x250" className="mb-8" />

            <h3 className="text-xl font-serif italic text-white mb-6">
              Up Next
            </h3>
            <div className="flex flex-col gap-5">
              {relatedVideos.length > 0 ? (
                relatedVideos.slice(0, 8).map((v) => (
                  <Link
                    key={v.id}
                    href={`/watch/${v.id}`}
                    className="group flex gap-4 cursor-pointer"
                  >
                    <div className="relative flex-shrink-0 bg-zinc-900 rounded-sm overflow-hidden w-[160px] aspect-video">
                      <img
                        src={v.thumbnail}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out"
                        alt={v.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] tracking-widest rounded-sm text-zinc-300">
                        {v.duration}
                      </div>
                    </div>
                    <div className="flex-1 py-1">
                      <p className="line-clamp-2 text-sm font-light leading-relaxed text-zinc-200 group-hover:text-rose-600 transition-colors duration-300">
                        {v.title}
                      </p>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2 font-medium">
                        {Number(v.views || 0).toLocaleString()} views
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-zinc-600 font-light italic text-sm">
                  No related videos available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Featured Pornstars Grid */}
        <div className="mt-24 mb-16 border-t border-white/5 pt-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Sparkles
                className="text-amber-600"
                size={24}
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">
                Featured Pornstars
              </h3>
            </div>
            <Link
              href="/pornstars"
              className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300"
            >
              View Directory
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topPornstars.map((star) => (
              <Link
                key={star.id}
                href={`/pornstars/${star.id}`}
                className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]"
              >
                <img
                  src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                  alt={star.name}
                  className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-white font-serif italic text-xl tracking-wide mb-1">
                    {star.name}
                  </h4>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span>
                      {Number(star.views || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Curated For You (Related Grid) */}
        <div className="mt-16 border-t border-white/5 pt-16 pb-16">
          <div className="flex items-center gap-3 mb-10">
            <Film className="text-rose-800" size={24} strokeWidth={1.5} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide">
              More Porn Videos
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {relatedVideos.slice(0, 10).map((v) => (
              <Link
                key={v.id}
                href={`/watch/${v.id}`}
                className="group block cursor-pointer"
              >
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {v.duration}
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {v.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {Number(v.views || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* THE RABBIT HOLE ENGINE (Related Scenes) */}
        {/* -------------------------------------------------- */}
        {relatedVideos.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-6 mt-16 pt-10 border-t border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <Film className="text-rose-800" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">
                Continue Watching
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {relatedVideos.map((vid) => (
                <Link key={vid.id} href={`/watch/${vid.id}`} className="group block cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                      {vid.duration}
                    </div>
                    <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
                      HD
                    </div>
                  </div>

                  <div className="mt-3 px-1">
                    <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                      {vid.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        {Number(vid.views).toLocaleString()} views
                      </span>
                      {vid.likes > 0 && (
                        <span className="text-rose-800/80">{vid.likes} ❤️</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
