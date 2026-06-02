'use client';

import { useEffect, useState } from 'react';
import { Heart, Share2, Download, Sparkles, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/src/components/ui/player/VideoPlayer';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  videoUrl: string;
}

interface Pornstar {
  id: number;
  name: string;
  image: string;
  videos: number;
  views: string;
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const router = useRouter();

  // Hardcoded muses
  const pornstars: Pornstar[] = [
    { id: 1, name: "Sunny Leone", image: "/thumbnails/thmbnl_000007.png", videos: 124, views: "18.2M" },
    { id: 2, name: "Emily Willis", image: "/thumbnails/thmbnl_000005.png", videos: 89, views: "14.7M" },
    { id: 3, name: "Lana Rhoades", image: "/thumbnails/thmbnl_000002.png", videos: 67, views: "22.4M" },
    { id: 4, name: "Mia Malkova", image: "/thumbnails/thmbnl_000008.png", videos: 95, views: "19.8M" },
    { id: 5, name: "Blake Blossom", image: "/thumbnails/thmbnl_0000011.png", videos: 54, views: "9.3M" },
  ];

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const res = await fetch(`/api/videos/${id}`);
        const data = await res.json();

        if (res.ok) {
          setVideo(data);

          const allRes = await fetch('/api/videos');
          const allVideos = await allRes.json();
          const filtered = allVideos.filter((v: Video) => v.id !== parseInt(id));
          setRelatedVideos(filtered);
        } else {
          setVideo(null);
        }
      } catch (err) {
        console.error(err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [params]);

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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-light tracking-widest uppercase">
        Scene not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* Navbar: Elegant Frosted Glass */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button onClick={() => router.push('/')} className="text-3xl tracking-widest hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </button>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <button onClick={() => router.push('/')} className="hover:text-white transition duration-300">Home</button>
              <button className="hover:text-white transition duration-300">Desi</button>
              <button className="hover:text-white transition duration-300">Trending</button>
              <button className="hover:text-white transition duration-300">Models</button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-white text-[11px] uppercase tracking-widest transition duration-300">Login</button>
            <button className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300">Upload</button>
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
                <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                  <span>{Number(video.views).toLocaleString()} views</span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  <span>Curated 2 days ago</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-sm border transition-all duration-300 text-[11px] uppercase tracking-widest ${liked ? 'border-rose-800/50 bg-rose-900/20 text-rose-500' : 'border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white'}`}
                  >
                    <Heart className={liked ? "fill-rose-500" : ""} size={16} strokeWidth={1.5} /> {liked ? 'Adored' : 'Adore'}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Share2 size={16} strokeWidth={1.5} /> Share
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Download size={16} strokeWidth={1.5} /> Save
                  </button>
                </div>
              </div>

              {/* Minimalist Tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {["Desi", "BBC", "Hardcore", "Interracial", "HD", "Creampie"].map((tag, i) => (
                  <span key={i} className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-4 py-1.5 text-[10px] tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Up Next Sidebar */}
          <div className="w-full lg:w-[32%]">
            <h3 className="text-xl font-serif italic text-white mb-6">Up Next</h3>
            <div className="flex flex-col gap-5">
              {relatedVideos.slice(0, 8).map((v) => (
                <Link key={v.id} href={`/watch/${v.id}`} className="group flex gap-4 cursor-pointer">
                  <div className="relative flex-shrink-0 bg-zinc-900 rounded-sm overflow-hidden w-[160px] aspect-video">
                    <img src={v.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out" alt={v.title} />
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
                      {Number(v.views).toLocaleString()} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Muses */}
        <div className="mt-24 mb-16 border-t border-white/5 pt-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">Featured Muses</h3>
            </div>
            <a href="#" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
              View Directory
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {pornstars.map((star) => (
              <div key={star.id} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]">
                <img src={star.image} alt={star.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-white font-serif italic text-xl tracking-wide mb-1">{star.name}</h4>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span>{star.videos} scenes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated For You (Previously 'You May Also Like') */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-10">
            <Film className="text-rose-800" size={24} strokeWidth={1.5} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide">Curated For You</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {relatedVideos.slice(0, 5).map((v) => (
              <Link key={v.id} href={`/watch/${v.id}`} className="group block cursor-pointer">
                <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">
                    {v.duration}
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
                    {v.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}