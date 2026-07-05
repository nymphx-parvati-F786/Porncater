import { PrismaClient } from "@prisma/client";
import { Metadata, ResolvingMetadata } from 'next';
import { Share2, Download, Sparkles, Film, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import AdSpace from "@/src/components/ui/ads/AdSpace";

// Import our interactive client islands
import LikeButton from "@/src/components/ui/watch/LikeButton";
import ViewTracker from "@/src/components/ui/watch/ViewTracker";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards } from "@/src/data/adConfig";

const prisma = new PrismaClient();

interface PageProps {
  // 🚀 FIXED: Next.js App Router exposes parent parameters as a Promise array
  params: Promise<{ id: string; slug: string }>;
}

// =========================================================
// 🚀 PREMIUM TUBE SEO ENGINE (METADATA GENERATOR)
// =========================================================
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) {
    return { title: 'Video Not Found | PornCater' };
  }

  // Pull minimal fields directly inside database space
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      pornstars: { select: { name: true } }
    }
  });

  if (!video) {
    return { title: 'Video Removed | PornCater' };
  }

  const starNames = video.pornstars.map(s => s.name).join(', ');
  const tags = video.tags?.join(', ') || '';
  const seoKeywords = `${starNames}, ${tags}, ${video.title}, free porn, HD adult video, stream`;
  const seoDescription = `Watch ${video.title}${starNames ? ` featuring ${starNames}` : ''}. Stream exclusive HD adult cinema on PornCater.`;

  return {
    title: `${video.title} - PornCater`,
    description: seoDescription,
    keywords: seoKeywords,
    openGraph: {
      title: video.title,
      description: seoDescription,
      url: `https://porncater.com/watch/${video.id}/${resolvedParams.slug}`,
      siteName: 'PornCater',
      images: [
        {
          url: video.thumbnail,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: seoDescription,
      images: [video.thumbnail],
    },
  };
}

// =========================================================
// 🎬 PRIMARY SERVER WATCH COMPONENT
// =========================================================
export default async function WatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) notFound();

  // 1. Core data fetch inside local database region thread
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      pornstars: { select: { id: true, name: true, avatarUrl: true, slug: true } }
    }
  });

  if (!video) notFound();

  // 2. Fetch related blocks and performer slots in parallel (Zero network waterfall)
  const starIds = video.pornstars.map(s => s.id);
  const tags = video.tags || [];

  const [relatedVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      where: {
        id: { not: videoId },
        OR: [
          ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []),
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
        ]
      },
      take: 10,
      orderBy: { views: 'desc' },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true } // 🚀 Added slug selection
    }),
    prisma.pornstar.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, name: true, avatarUrl: true, views: true, slug: true } // 🚀 Added slug selection
    })
  ]);

  const uploadDate = new Date(video.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">

      {/* Invisible View Retention Metric Tracker Island */}
      <ViewTracker videoId={video.id} />

      {/* Navbar: Elegant Frosted Glass */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl tracking-widest hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/category/desi" className="hover:text-white transition duration-300">Desi</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-white text-[11px] uppercase tracking-widest transition duration-300">Login</button>
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300">Upload</Link>
          </div>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT: Cinematic Fluid Media Stream Player + Details */}
          <div className="w-full lg:w-[68%]">
            <div className="bg-black aspect-video rounded-sm overflow-hidden ring-1 ring-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <VideoPlayer
                key={video.id}
                src={video.videoUrl}
                poster={video.thumbnail}
                title={video.title}
                vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5945800"
              />
            </div>

            <div className="mt-8 border-b border-white/5 pb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-light text-white leading-tight tracking-wide pr-4">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between mt-6 gap-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                    <span>{Number(video.views || 0).toLocaleString()} views</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span>{uploadDate}</span>
                  </div>

                  {video.pornstars && video.pornstars.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-600">Featuring:</span>
                      <div className="flex flex-wrap gap-2">
                        {video.pornstars.map((star) => (
                          /* 🚀 SEO FIX: Directing link anchors to alphanumeric performer slugs instead of mechanical integers */
                          <Link key={star.id} href={`/pornstars/${star.slug}`} className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full pr-3 py-0.5 transition-colors">
                            <img src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-[10px] text-zinc-300 uppercase tracking-widest">{star.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <LikeButton videoId={video.id} />
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Share2 size={16} strokeWidth={1.5} /> Share
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest">
                    <Download size={16} strokeWidth={1.5} /> Save
                  </button>
                </div>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-medium">Video Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, i) => (
                      <Link key={i} href={`/category/${tag.toLowerCase()}`} className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-4 py-1.5 text-[10px] tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm cursor-pointer">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Below the video player */}
              <DirectBanner
                banners={blackedSuperLeaderboards}
                format="banner-970x90"
                className="mb-10"
              />
            </div>
          </div>

          {/* RIGHT: Up Next Interactive Sidebar Module */}
          <div className="w-full lg:w-[32%]">
            <AdSpace zoneId="5944198" format="banner-300x250" className="mb-8" />
            <AdSpace zoneId="5944198" format="banner-300x250" className="mb-8" />
            <h3 className="text-xl font-serif italic text-white mb-6">Up Next</h3>
            <div className="flex flex-col gap-5">
              {relatedVideos.length > 0 ? (
                relatedVideos.slice(0, 8).map((v) => (
                  /* 🚀 SEO FIX: Combines unique identity tags with alphanumeric title strings to prevent catalog overlapping collisions */
                  <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} className="group flex gap-4 cursor-pointer">
                    <div className="relative flex-shrink-0 bg-zinc-900 rounded-sm overflow-hidden w-[160px] aspect-video">
                      <img src={v.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out" alt={v.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] tracking-widest rounded-sm text-zinc-300">{v.duration}</div>
                    </div>
                    <div className="flex-1 py-1">
                      <p className="line-clamp-2 text-sm font-light leading-relaxed text-zinc-200 group-hover:text-rose-600 transition-colors duration-300">{v.title}</p>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2 font-medium">{Number(v.views || 0).toLocaleString()} views</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-zinc-600 font-light italic text-sm">No related videos available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Featured Pornstars Section */}
        <div className="mt-24 mb-16 border-t border-white/5 pt-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">Featured Pornstars</h3>
            </div>
            <Link href="/pornstars" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">View Directory</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topPornstars.map((star) => (
              /* 🚀 SEO FIX: Directing relational maps back into verified string parameters */
              <Link key={star.id} href={`/pornstars/${star.slug}`} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]">
                <img src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-white font-serif italic text-xl tracking-wide mb-1">{star.name}</h4>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span>{Number(star.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* More Porn Videos Grid */}
        {relatedVideos.length > 0 && (
          <div className="mt-16 border-t border-white/5 pt-16 pb-16">
            <div className="flex items-center gap-3 mb-10">
              <Film className="text-rose-800" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white tracking-wide">Continue Watching</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
              {relatedVideos.slice(0, 10).map((vid) => (
                /* 🚀 SEO FIX: Structured link parameters layout */
                <Link key={vid.id} href={`/watch/${vid.id}/${vid.slug}`} className="group block cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] tracking-widest rounded-sm text-zinc-300">{vid.duration}</div>
                    <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">HD</div>
                  </div>
                  <div className="mt-3 px-1">
                    <h4 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">{vid.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-1">{Number(vid.views).toLocaleString()} views</span>
                      {vid.likes > 0 && <span className="text-rose-800/80">{vid.likes} ❤️</span>}
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