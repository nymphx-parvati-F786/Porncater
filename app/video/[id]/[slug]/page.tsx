import { prisma } from "@/lib/prisma";
import { Metadata, ResolvingMetadata } from "next";
import {
  Play, User, Flame, Clock, Sparkles,
  MonitorPlay, Star, ThumbsUp, Filter,
  TrendingUp, Menu, Search, Video, ChevronDown, // <-- Added ChevronDown
  Eye,
  ShieldAlert,
  Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SearchBar from "@/src/components/ui/SearchBar";

// Core Components
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";

// Interactive Client Islands
import LikeButton from "@/src/components/ui/watch/LikeButton";
import ViewTracker from "@/src/components/ui/watch/ViewTracker";
import ReportButton from "@/src/components/ui/watch/ReportButton";
import EmbedCodeGenerator from "@/src/components/ui/watch/EmbedCodeGenerator";

// Ad Units
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import AdSpace from "@/src/components/ui/ads/AdSpace";
import JuicyAd from "@/src/components/ui/ads/JuicyAdsBanner";
import { blackedSuperLeaderboards, blackedLeaderboards } from "@/src/data/adConfig";
import SmartHeader from "@/src/components/ui/SmartHeader";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

const nativeAds = [
  { id: "ad1", title: "Play this Adult Game - No Download Required!", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad2", title: "Meet Horny MILFs in your Exact Area Tonight", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad3", title: "Exclusive Blacked VIP Pass - 70% OFF Today", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-promo-1.jpg", url: "https://your-affiliate-link.com" },
];

const formatDuration = (seconds: number | string | null | undefined) => {
  if (!seconds) return "10:24";
  const num = Number(seconds);
  if (isNaN(num)) return String(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// =========================================================
// 🚀 TUBE SEO ENGINE
// =========================================================
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) return { title: "Video Not Found | PornCater" };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { title: true, thumbnail: true, tags: true, status: true, pornstars: { select: { name: true } } }
  });

  if (!video) return { title: "Video Removed | PornCater" };

  if (video.status === "DMCA_TAKEDOWN") {
    return {
      title: "Content Unavailable - DMCA Takedown | PornCater",
      description: "Access to this video has been disabled in compliance with copyright regulations.",
      robots: { index: false, follow: false, nocache: true },
    };
  }

  const starNames = video.pornstars.map(s => s.name).join(', ');
  const tags = video.tags?.join(', ') || '';
  const seoKeywords = `${starNames}, ${tags}, ${video.title}, free HD porn, watch sex tube, adult video stream`;
  const seoDescription = `Watch ${video.title}${starNames ? ` starring ${starNames}` : ''} in full HD. Stream exclusive free porn scenes on PornCater.`;
  const canonicalUrl = `https://porncater.com/video/${videoId}/${resolvedParams.slug}`;

  return {
    title: `${video.title} - Free HD Porn | PornCater`,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: video.title,
      description: seoDescription,
      url: canonicalUrl,
      siteName: "PornCater",
      images: [{ url: video.thumbnail, width: 1280, height: 720, alt: video.title }],
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: seoDescription,
      images: [video.thumbnail],
    },
  };
}

// =========================================================
// 🎬 PRIMARY SERVER WATCH PAGE
// =========================================================
export default async function WatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) notFound();

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      pornstars: { select: { id: true, name: true, avatarUrl: true, slug: true, views: true } }
    }
  });

  if (!video) notFound();

  if (video.status === "DMCA_TAKEDOWN") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">
        <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <ShieldAlert className="text-rose-700 mx-auto mb-6 animate-pulse" size={60} />
          <h2 className="text-2xl text-white mb-4">Content Disabled Under Copyright Law</h2>
          <Link href="/" className="bg-rose-700 text-white px-6 py-2.5 rounded-sm">Return Home</Link>
        </div>
      </div>
    );
  }

  const starIds = video.pornstars.map(s => s.id);
  const tags = video.tags || [];

  const [relatedVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      where: {
        id: { not: videoId },
        status: "PUBLISHED",
        OR: [
          ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []),
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
        ]
      },
      take: 30,
      orderBy: { views: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true }
    }),
    prisma.pornstar.findMany({
      take: 8,
      orderBy: { views: "desc" },
      select: { id: true, name: true, avatarUrl: true, views: true, slug: true }
    })
  ]);

  const uploadDate = new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const durationParts = (video.duration || "0:00").split(':').map(Number);
  let isoDuration = "PT0M0S";
  if (durationParts.length === 2) {
    isoDuration = `PT${durationParts[0]}M${durationParts[1]}S`;
  } else if (durationParts.length === 3) {
    isoDuration = `PT${durationParts[0]}H${durationParts[1]}M${durationParts[2]}S`;
  }

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `Watch ${video.title} free on PornCater.`,
    thumbnailUrl: [video.thumbnail],
    uploadDate: new Date(video.createdAt).toISOString(),
    duration: isoDuration,
    contentUrl: video.videoUrl,
    embedUrl: `https://porncater.com/embed/${video.id}`,
    isFamilyFriendly: false,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views || 0
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://porncater.com/" },
      { "@type": "ListItem", position: 2, name: "Video", item: `https://porncater.com/video/${video.id}/${resolvedParams.slug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdSchema, breadcrumbSchema]) }} />
      <ViewTracker videoId={video.id} />

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
        <SmartHeader categories={megaCategories} />

      {/* =========================================
          💰 AD ZONE: TOP LEADERBOARD
          ========================================= */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-2 pb-2 flex justify-center overflow-hidden">
        <DirectBanner banners={blackedSuperLeaderboards} format="banner-970x70" />
      </div>

      {/* =========================================
          🎥 SCALED TUBE LAYOUT
          🔥 Changed: Added max-w, extra padding (px-8 lg:px-12), and pt-2
          ========================================= */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-2 flex flex-col lg:flex-row gap-4 lg:gap-6">

        {/* LEFT COLUMN: PLAYER & INFO */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Video player scaled down cleanly */}
          <div className="w-full bg-black aspect-video rounded-sm overflow-hidden border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <VideoPlayer
              key={video.id}
              src={video.videoUrl}
              poster={video.thumbnail}
              title={video.title}
              vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5945800"
            />
          </div>

          {/* Tight Video Details Block */}
          <div className="bg-[#111] border border-zinc-800 p-3 md:p-4 rounded-sm">
            <h1 className="text-xl md:text-2xl font-medium text-white leading-tight mb-3 break-words">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5 text-[11px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1 text-emerald-500"><ThumbsUp size={14} /> 98%</span>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {Number(video.views || 0).toLocaleString()}</span>
                <span className="text-zinc-700">•</span>
                <span>{uploadDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <LikeButton videoId={video.id} />
                <EmbedCodeGenerator videoId={video.id} videoTitle={video.title} />
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] md:text-xs font-bold uppercase rounded-sm transition">
                  <Download size={14} /> Save
                </button>
                <ReportButton videoId={video.id} />
              </div>
            </div>

            {/* Meta: Stars & Tags */}
            <div className="pt-3 flex flex-col gap-2">
              {video.pornstars && video.pornstars.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">Stars:</span>
                  {video.pornstars.map((star) => (
                    <Link key={star.id} href={`/pornstars/${star.slug}`} className="text-rose-500 hover:text-rose-400 text-xs font-bold transition">
                      {star.name}
                    </Link>
                  ))}
                </div>
              )}
              {video.tags && video.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase mr-1">Tags:</span>
                  {video.tags.map((tag, i) => (
                    <Link key={i} href={`/category/${tag.toLowerCase()}`} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm transition">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STACKED SQUARES (THE MONEY MAKER) */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-3 mx-auto lg:mx-0">
          {/* Ad 1 */}
          <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto rounded-sm">
            <JuicyAd adZone="1122022" width="300" height="250" />
          </div>
          {/* Ad 2 */}
          <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto hidden sm:block rounded-sm">
            <AdSpace zoneId="5944198" format="banner-300x250" />
          </div>
          {/* Ad 3 */}
          <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto hidden lg:block rounded-sm">
            <JuicyAd adZone="1122022" width="300" height="250" />
          </div>
        </div>

      </div>

      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-6">
        {/* =========================================
            💰 AD ZONE: MID-PAGE LEADERBOARD
            ========================================= */}
        <div className="flex justify-center mb-6 mt-2 overflow-hidden">
          <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
        </div>

        {/* =========================================
            ⭐ TIGHT FEATURED STARS
            ========================================= */}
        {topPornstars.length > 0 && (
          <div className="mb-6 bg-[#111] border border-zinc-800 p-3 rounded-sm flex items-center overflow-x-auto scrollbar-hide gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 shrink-0 ml-1">Hot:</span>
            {topPornstars.map(star => (
              <Link key={star.id} href={`/pornstars/${star.slug}`} className="flex items-center gap-2 shrink-0 group">
                <Image src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} width={24} height={24} className="rounded-full object-cover border border-zinc-700 group-hover:border-rose-500 transition-colors" />
                <span className="text-xs text-zinc-400 group-hover:text-white font-medium uppercase tracking-wider transition-colors">{star.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* =========================================
            🎬 RELATED VIDEOS TIGHT GRID
            ========================================= */}
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2 ml-1">
          <h2 className="text-lg font-bold uppercase tracking-widest text-white flex items-center gap-2">
            Related Videos
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {/* Native Ad Blended */}
          {nativeAds.slice(0, 1).map((ad) => (
            <a key={ad.id} href={ad.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex flex-col bg-[#0a0a0a] border border-zinc-800 rounded-sm overflow-hidden hover:border-amber-900/50 transition-colors">
              <div className="relative aspect-video">
                <img src={ad.thumbnail} alt={ad.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all" />
                <div className="absolute top-1 left-1 bg-amber-600 text-white text-[7px] font-bold px-1 rounded-sm uppercase">AD</div>
              </div>
              <div className="p-2">
                <h3 className="text-xs text-amber-500 font-medium line-clamp-2 leading-tight">{ad.title}</h3>
              </div>
            </a>
          ))}

          {/* Videos */}
          {relatedVideos.map((v) => (
            <Link key={v.id} href={`/video/${v.id}/${v.slug}`} className="group flex flex-col bg-[#0a0a0a] border border-zinc-800 rounded-sm overflow-hidden hover:border-rose-900 transition-colors">
              <div className="relative aspect-video bg-black">
                <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">{formatDuration(v.duration)}</div>
                <div className="absolute top-1 left-1 bg-rose-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase">HD</div>
              </div>
              <div className="p-2 flex flex-col flex-grow">
                <h3 className="text-xs text-zinc-300 font-light line-clamp-2 leading-tight group-hover:text-rose-500 transition-colors">
                  {v.title}
                </h3>
                <div className="mt-auto pt-2 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                  <span>{Number(v.views || 0).toLocaleString()} views</span>
                  <span className="text-emerald-500 hidden sm:inline">98%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505]">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography. By entering this site you swear that you are of legal age in your area to view adult material and that you wish to view such material.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}