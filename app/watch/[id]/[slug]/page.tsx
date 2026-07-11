import { PrismaClient } from "@prisma/client";
import { Metadata, ResolvingMetadata } from 'next';
import { Share2, Download, Sparkles, Film, Eye, Clock, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import AdSpace from "@/src/components/ui/ads/AdSpace";
import LikeButton from "@/src/components/ui/watch/LikeButton";
import ViewTracker from "@/src/components/ui/watch/ViewTracker";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) return { title: 'Video Not Found | PornCater' };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { pornstars: { select: { name: true } } }
  });

  if (!video) return { title: 'Video Removed | PornCater' };

  const starNames = video.pornstars.map(s => s.name).join(', ');
  const tags = video.tags?.join(', ') || '';
  const seoDescription = `Watch ${video.title}${starNames ? ` featuring ${starNames}` : ''}. Stream exclusive HD adult cinema on PornCater.`;

  return {
    title: `${video.title} - PornCater`,
    description: seoDescription,
    openGraph: { title: video.title, description: seoDescription, images: [{ url: video.thumbnail }] },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) notFound();

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { pornstars: { select: { id: true, name: true, avatarUrl: true, slug: true } } }
  });

  if (!video) notFound();

  const starIds = video.pornstars.map(s => s.id);
  const tags = video.tags || [];

  const [relatedVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      where: { id: { not: videoId }, OR: [ ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []), ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : []) ] },
      take: 20,
      orderBy: { views: 'desc' },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true }
    }),
    prisma.pornstar.findMany({ take: 6, orderBy: { views: 'desc' }, select: { id: true, name: true, avatarUrl: true, views: true, slug: true } })
  ]);

  const uploadDate = new Date(video.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 pb-20">
      <ViewTracker videoId={video.id} />

      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl tracking-widest">
            <span className="font-serif italic text-rose-800 pr-1">Porn</span><span className="font-light text-white">Cater</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin/upload" className="bg-rose-600 hover:bg-rose-700 px-6 py-2 text-sm font-semibold rounded">Upload More</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-[68%]">
            <div className="bg-black aspect-video rounded overflow-hidden shadow-2xl">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnail}
                title={video.title}
                vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5945800"
                autoNext={true}
              />
            </div>

            <div className="mt-8">
              <h1 className="text-4xl font-light leading-tight mb-4">{video.title}</h1>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <span>{Number(video.views).toLocaleString()} views</span>
                <span>{uploadDate}</span>
              </div>

              {video.pornstars?.length > 0 && (
                <div className="flex gap-3 mt-6 flex-wrap">
                  {video.pornstars.map(star => (
                    <Link key={star.id} href={`/pornstars/${star.slug}`} className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-800">
                      <img src={star.avatarUrl ?? "/images/default-avatar.png"} className="w-8 h-8 rounded-full" alt={star.name} />
                      <span>{star.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <LikeButton videoId={video.id} />
                <button className="flex items-center gap-3 px-8 py-3 border border-zinc-700 hover:border-white text-sm uppercase tracking-widest">Share</button>
              </div>
            </div>
          </div>

          <div className="lg:w-[32%]">
            <h3 className="text-xl mb-6 flex items-center gap-2"><Play className="text-rose-500" /> Up Next - Keep Gooning</h3>
            <div className="space-y-6">
              {relatedVideos.slice(0, 6).map(v => (
                <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} className="group flex gap-4">
                  <div className="relative w-40 aspect-video flex-shrink-0">
                    <img src={v.thumbnail} className="rounded object-cover w-full h-full group-hover:scale-105 transition" />
                    <div className="absolute bottom-1 right-1 bg-black/70 px-2 py-0.5 text-xs rounded">{v.duration}</div>
                  </div>
                  <div>
                    <p className="line-clamp-3 text-sm group-hover:text-rose-400">{v.title}</p>
                    <p className="text-xs text-zinc-500 mt-2">{Number(v.views).toLocaleString()} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Endless Goon Feed */}
        <div className="mt-24 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3 mb-10">
            <Clock className="text-rose-600" />
            <h2 className="text-3xl font-serif">More Addiction Fuel</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relatedVideos.map((vid) => (
              <Link key={vid.id} href={`/watch/${vid.id}/${vid.slug}`} className="group">
                <div className="aspect-video bg-zinc-900 rounded overflow-hidden relative">
                  <img src={vid.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-1">{vid.duration}</div>
                </div>
                <p className="mt-3 text-sm line-clamp-2 group-hover:text-rose-400">{vid.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}