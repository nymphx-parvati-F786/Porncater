'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Share2, Download, Star } from 'lucide-react';
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

  // Hardcoded pornstars for now (we'll make this dynamic later)
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

        // Fetch current video
        const res = await fetch(`/api/videos/${id}`);
        const data = await res.json();

        if (res.ok) {
          setVideo(data);

          // Fetch related videos (all videos except current)
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
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading video...</div>;
  }

  if (!video) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Navbar */}
      <nav className="bg-black/95 backdrop-blur-2xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => router.push('/')} className="text-3xl font-bold tracking-tighter hover:opacity-90 transition">
              <span className="text-pink-500">PORN</span>CATER
            </button>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
              <a href="#" className="hover:text-pink-400 transition">Home</a>
              <a href="#" className="hover:text-pink-400 transition">Desi</a>
              <a href="#" className="hover:text-pink-400 transition">Trending</a>
              <a href="#" className="hover:text-pink-400 transition">Pornstars</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 rounded-full border border-zinc-700 hover:border-pink-500 text-sm transition">Login</button>
            <button className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-2.5 rounded-full text-sm font-semibold hover:scale-[1.02] transition">Upload</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT: Player + Info */}
          <div className="flex-1">
            <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
              <VideoPlayer 
                src={video.videoUrl} 
                poster={video.thumbnail} 
                title={video.title} 
              />
            </div>

            {/* Video Info */}
            <div className="mt-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight pr-4">{video.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between mt-5 gap-y-4">
                <div className="flex items-center gap-5 text-sm text-gray-400">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <span>2 days ago</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition ${liked ? 'border-pink-500 text-pink-500 bg-pink-950/30' : 'border-zinc-700 hover:border-pink-500'}`}
                  >
                    <Heart className={liked ? "fill-pink-500" : ""} size={18} /> Like
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 hover:border-pink-500 transition">
                    <Share2 size={18} /> Share
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-700 hover:border-pink-500 transition">
                    <Download size={18} /> Download
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {["Desi", "BBC", "Hardcore", "Interracial", "HD", "Creampie"].map((tag, i) => (
                  <span key={i} className="bg-zinc-900 hover:bg-zinc-800 text-pink-400 text-xs px-5 py-2 rounded-full transition cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Up Next Sidebar */}
          <div className="w-full lg:w-[380px]">
            <h3 className="text-xl font-semibold mb-5">Up Next</h3>

            <div className="space-y-4">
              {relatedVideos.slice(0, 8).map((v) => (
                <Link 
                  key={v.id} 
                  href={`/watch/${v.id}`} 
                  className="group flex gap-4 p-2 -mx-2 rounded-2xl hover:bg-zinc-950 transition"
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={v.thumbnail} 
                      className="w-[148px] aspect-video object-cover rounded-xl" 
                      alt={v.title}
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {v.duration}
                    </div>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-3 font-medium leading-tight group-hover:text-pink-400 transition">
                      {v.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-3">{v.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Pornstars */}
        <div className="mt-16 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3">
              <Star className="text-pink-500" /> Featured Pornstars
            </h3>
            <a href="#" className="text-pink-500 text-sm hover:underline">View All →</a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {pornstars.map((star) => (
              <div key={star.id} className="group bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 hover:border-pink-500/60 transition cursor-pointer">
                <div className="relative">
                  <img src={star.image} alt={star.name} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
                  <div className="absolute bottom-4 left-4">
                    <h4 className="text-white font-semibold text-xl tracking-tight">{star.name}</h4>
                  </div>
                </div>
                <div className="px-4 py-4 flex justify-between text-sm text-gray-400">
                  <span>{star.videos} videos</span>
                  <span>{star.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedVideos.slice(0, 5).map((v) => (
              <Link key={v.id} href={`/watch/${v.id}`} className="group">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
                  <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover group-hover:scale-105 transition" />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-0.5 rounded">{v.duration}</div>
                </div>
                <p className="mt-3 text-sm font-medium line-clamp-2 group-hover:text-pink-400 transition">{v.title}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}