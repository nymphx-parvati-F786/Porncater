import { prisma } from "@/lib/prisma";
import { Metadata, ResolvingMetadata } from "next";
import {
  Share2, Download, Sparkles, Film, ShieldAlert,
  ThumbsUp, Eye, Calendar, Tag, MonitorPlay, TrendingUp,
  Clock, Star, Filter, Menu,Flame, Search, Video, Code, Flag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

// Core Components
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import SearchBar from "@/src/components/ui/SearchBar";

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

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

const megaCategories = [
  "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
  "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
  "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
];

// Camouflaged Native Ads for the Sidebar & Recommendation Grids
const nativeAds = [
  { id: "ad1", title: "Play this Adult Game - No Download Required!", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad2", title: "Meet Horny MILFs in your Exact Area Tonight", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-dating-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad3", title: "Exclusive Blacked VIP Pass - 70% OFF Today", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-promo-1.jpg", url: "https://your-affiliate-link.com" },
  { id: "ad4", title: "Try Not To Cum Playing This 3D Sex Game", thumbnail: "https://porncater-pz.b-cdn.net/mad-cheddar-media/native/native-game-2.jpg", url: "https://your-affiliate-link.com" },
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
// 🚀 TUBE SEO ENGINE (METADATA GENERATOR + DMCA SHIELD)
// =========================================================
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) {
    return { title: "Video Not Found | PornCater" };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { title: true, thumbnail: true, tags: true, status: true, pornstars: { select: { name: true } } }
  });

  if (!video) {
    return { title: "Video Removed | PornCater" };
  }

  // 🔥 DMCA De-indexing Guard
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
  const canonicalUrl = `https://porncater.com/watch/${videoId}/${resolvedParams.slug}`;

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

  // 🛡️ DMCA Safe Harbor Intercept Frame
  if (video.status === "DMCA_TAKEDOWN") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">
        <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-3xl tracking-widest">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <div className="border border-zinc-800 bg-[#111] rounded-sm p-12 shadow-2xl flex flex-col items-center">
            <ShieldAlert className="text-rose-700 mb-6 animate-pulse" size={60} strokeWidth={1.5} />
            <h2 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide mb-4">
              Content Disabled Under Copyright Law
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8 font-light text-xs">
              Access to this media module has been permanently disabled in response to a formal copyright infringement notice submitted under the Digital Millennium Copyright Act (DMCA).
            </p>
            <div className="bg-black/80 border border-zinc-800 px-6 py-4 rounded-sm mb-8 w-full max-w-md text-left">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">Asset ID</span>
              <p className="text-zinc-300 text-xs font-mono truncate">{video.title}</p>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mt-3 mb-1">Safe Harbor Status</span>
              <p className="text-rose-600 text-xs font-mono font-bold">DMCA 512(c) Active Protocol</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="bg-rose-700 text-white px-6 py-2.5 rounded-sm text-xs uppercase font-bold tracking-wider hover:bg-rose-600 transition">
                Return Home
              </Link>
              <Link href="/dmca" className="border border-zinc-800 text-zinc-400 px-6 py-2.5 rounded-sm text-xs uppercase font-bold tracking-wider hover:text-white transition">
                DMCA Notice Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Related & Recommendation Query
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
      take: 18,
      orderBy: { views: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true }
    }),
    prisma.pornstar.findMany({
      take: 6,
      orderBy: { views: "desc" },
      select: { id: true, name: true, avatarUrl: true, views: true, slug: true }
    })
  ]);

  const uploadDate = new Date(video.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  // ISO Duration helper for Google Schema
  const durationParts = (video.duration || "0:00").split(':').map(Number);
  let isoDuration = "PT0M0S";
  if (durationParts.length === 2) {
    isoDuration = `PT${durationParts[0]}M${durationParts[1]}S`;
  } else if (durationParts.length === 3) {
    isoDuration = `PT${durationParts[0]}H${durationParts[1]}M${durationParts[2]}S`;
  }

  // Schema.org VideoObject JSON-LD
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": `Watch ${video.title} free on PornCater. HD Porn video streaming.`,
    "thumbnailUrl": [video.thumbnail],
    "uploadDate": new Date(video.createdAt).toISOString(),
    "duration": isoDuration,
    "contentUrl": video.videoUrl,
    "embedUrl": `https://porncater.com/embed/${video.id}`,
    "isFamilyFriendly": false, // CRITICAL FOR PORN SEO
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": video.views || 0
    },
    "actor": video.pornstars.map(star => ({
      "@type": "PerformanceRole",
      "actor": { "@type": "Person", "name": star.name }
    }))
  };

  const rawCategory = video.tags && video.tags.length > 0 ? video.tags[0] : "HD";
  const primaryCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
  const categorySlug = rawCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://porncater.com/" },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://porncater.com/category/" },
      { "@type": "ListItem", "position": 3, "name": primaryCategory, "item": `https://porncater.com/category/${categorySlug}` },
      { "@type": "ListItem", "position": 4, "name": video.title, "item": `https://porncater.com/watch/${video.id}/${resolvedParams.slug}` }
    ]
  };

  const combinedSchema = [jsonLdSchema, breadcrumbSchema];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-12">
      {/* 🔥 MASTER SEO GRAPH INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <ViewTracker videoId={video.id} />

      {/* =========================================
          🔥 SEXY FROSTED GLASS MEGA-HEADER
          ========================================= */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/90 flex flex-col transition-all">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden text-zinc-400 hover:text-white transition">
              <Menu size={28} />
            </button>
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="md:hidden text-zinc-400 hover:text-white transition">
              <Search size={24} />
            </button>
            <Link href="/admin/upload" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 backdrop-blur-sm">
              <Video size={16} /> Upload
            </Link>
            <Link href="/login" className="bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(190,18,60,0.4)]">
              Sign In
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <MonitorPlay size={18} /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <TrendingUp size={18} /> Trending
            </Link>
            <Link href="/latest" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Clock size={18} /> New Videos
            </Link>
            <Link href="/top-rated" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Star size={18} /> Top Rated
            </Link>
            <Link href="/pornstars" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Sparkles size={18} /> Pornstars
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/20">
          <div className="max-w-[1600px] mx-auto px-2 lg:px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 text-zinc-400 mr-2 shrink-0 px-2">
              <Filter size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Niches</span>
            </div>
            {megaCategories.map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.toLowerCase()}`}
                prefetch={false}
                className="whitespace-nowrap bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm shrink-0 backdrop-blur-md"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* =========================================
          💰 AD ZONE 1: TOP SUPER LEADERBOARD
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2">
        <DirectBanner banners={blackedSuperLeaderboards} format="banner-970x70" />
      </div>

      {/* =========================================
          🎥 MAIN THEATER & SIDEBAR LAYOUT
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 8 COLS: FLUID VIDEO PLAYER & CONTROLS */}
          <div className="lg:col-span-8 flex flex-col">

            {/* VIDEO PLAYER CONTAINER */}
            <div className="relative w-full aspect-video bg-black rounded-sm overflow-hidden ring-1 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
              <VideoPlayer
                key={video.id}
                src={video.videoUrl}
                poster={video.thumbnail}
                title={video.title}
                vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5945800"
              />
            </div>

            {/* VIDEO INFO HEADER */}
            <div className="mt-5 border-b border-zinc-800 pb-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-white leading-tight tracking-wide">
                  {video.title}
                </h1>
                <span className="shrink-0 bg-rose-700/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-sm tracking-widest uppercase">
                  1080p HD
                </span>
              </div>

              {/* STATS & INTERACTIVE ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-zinc-900">
                <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5"><Eye size={15} className="text-rose-600" /> {Number(video.views || 0).toLocaleString()} views</span>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5"><Calendar size={15} className="text-zinc-500" /> {uploadDate}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold"><ThumbsUp size={14} /> 98% Rating</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <LikeButton videoId={video.id} />
                  <EmbedCodeGenerator videoId={video.id} videoTitle={video.title} />
                  <ReportButton videoId={video.id} />
                </div>
              </div>

              {/* FEATURING PORNSTARS STRIP */}
              {video.pornstars && video.pornstars.length > 0 && (
                <div className="mt-6 bg-[#111] border border-zinc-800/80 p-3 rounded-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Starring:</span>
                    <div className="flex flex-wrap gap-2">
                      {video.pornstars.map((star) => (
                        <Link key={star.id} href={`/pornstars/${star.slug}`} className="group/star flex items-center gap-2 bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/60 px-3 py-1 rounded-full transition-all">
                          <Image
                            src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                            alt={star.name}
                            width={28}
                            height={28}
                            className="rounded-full object-cover w-7 h-7 border border-zinc-700 group-hover/star:border-rose-500 transition-colors"
                          />
                          <span className="text-xs font-bold text-zinc-200 group-hover/star:text-rose-300 transition-colors">{star.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link href="/pornstars" className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition">
                    View Stars →
                  </Link>
                </div>
              )}

              {/* CATEGORY & TAG PILLS */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mr-1 flex items-center gap-1">
                    <Tag size={12} /> Tags:
                  </span>
                  {video.tags.map((tag, i) => (
                    <Link
                      key={i}
                      href={`/category/${tag.toLowerCase()}`}
                      className="bg-white/5 hover:bg-rose-900/30 border border-white/5 hover:border-rose-800/60 text-zinc-400 hover:text-rose-200 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-all rounded-sm"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* =========================================
                💰 AD ZONE 2: IN-PAGE BANNER UNDER VIDEO
                ========================================= */}
            <div className="py-6">
              <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
            </div>

          </div>

          {/* RIGHT 4 COLS: HIGH-YIELD MONETIZATION SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* 💰 AD ZONE 3: SIDEBAR 300x250 SQUARE BANNER */}
            <div className="bg-[#111] border border-zinc-800 p-2 rounded-sm flex justify-center items-center">
              <JuicyAd adZone="1122022" width="300" height="250" />
            </div>

            {/* UP NEXT VIDEO FEED */}
            <div className="bg-[#0c0c0c] border border-zinc-800/80 rounded-sm p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                  <Flame className="text-rose-700" size={20} /> Up Next
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Auto Play</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* 1. Related Videos (First 5) */}
                {relatedVideos.slice(0, 5).map((v) => (
                  <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} className="group flex gap-3 cursor-pointer">
                    <div className="relative shrink-0 w-36 aspect-video bg-zinc-900 overflow-hidden rounded-sm shadow-md">
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        sizes="144px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded-sm">
                        {formatDuration(v.duration)}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 overflow-hidden">
                      <h4 className="text-xs font-light text-zinc-200 line-clamp-2 group-hover:text-rose-500 transition-colors leading-snug">
                        {v.title}
                      </h4>
                      <div className="text-[10px] text-zinc-500 font-medium">
                        {Number(v.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </Link>
                ))}

                {/* 💰 AD ZONE 4: CAMOUFLAGED NATIVE AD IN FEED */}
                <a href={nativeAds[0].url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex gap-3 cursor-pointer bg-zinc-900/40 p-1.5 border border-amber-900/30 rounded-sm">
                  <div className="relative shrink-0 w-36 aspect-video bg-zinc-900 overflow-hidden rounded-sm">
                    <img src={nativeAds[0].thumbnail} alt={nativeAds[0].title} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-amber-600 text-white text-[7px] font-bold px-1 rounded-sm uppercase">
                      AD
                    </div>
                  </div>
                  <div className="flex flex-col justify-between py-0.5">
                    <h4 className="text-xs font-semibold text-amber-400 line-clamp-2 leading-snug">
                      {nativeAds[0].title}
                    </h4>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Sponsored</span>
                  </div>
                </a>

                {/* 2. Related Videos (Next 5) */}
                {relatedVideos.slice(5, 10).map((v) => (
                  <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} className="group flex gap-3 cursor-pointer">
                    <div className="relative shrink-0 w-36 aspect-video bg-zinc-900 overflow-hidden rounded-sm shadow-md">
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        sizes="144px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded-sm">
                        {formatDuration(v.duration)}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 overflow-hidden">
                      <h4 className="text-xs font-light text-zinc-200 line-clamp-2 group-hover:text-rose-500 transition-colors leading-snug">
                        {v.title}
                      </h4>
                      <div className="text-[10px] text-zinc-500 font-medium">
                        {Number(v.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </Link>
                ))}

              </div>
            </div>

            {/* 💰 AD ZONE 5: SECOND SIDEBAR AD SLOT */}
            <div className="bg-[#111] border border-zinc-800 p-2 rounded-sm flex justify-center items-center">
              <AdSpace zoneId="5944198" format="banner-300x250" />
            </div>

          </div>
        </div>

        {/* =========================================
            ⭐ FEATURED PORNSTARS STRIP
            ========================================= */}
        {topPornstars.length > 0 && (
          <section className="mt-16 pt-10 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
                <h2 className="text-2xl font-serif italic text-white tracking-wide">
                  Top Trending Performers
                </h2>
              </div>
              <Link href="/pornstars" className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest transition">
                A-Z Index →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {topPornstars.map((star) => (
                <Link key={star.id} href={`/pornstars/${star.slug}`} className="group flex items-center gap-3 bg-[#111] hover:bg-zinc-900 border border-zinc-800 hover:border-rose-900/50 p-1.5 pr-4 transition-all">
                  <div className="relative w-12 h-12 overflow-hidden shrink-0 border border-zinc-700 group-hover:border-rose-500 transition-colors">
                    <Image src={star.avatarUrl || "/thumbnails/default-avatar.png"} alt={star.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-zinc-200 font-bold text-sm truncate group-hover:text-rose-400 transition-colors">
                      {star.name}
                    </span>
                    <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mt-0.5">
                      {Number(star.views || 0).toLocaleString()} Views
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            🎬 MORE RECOMMENDED SEX SCENES GRID
            ========================================= */}
        {relatedVideos.length > 10 && (
          <section className="mt-12 pt-10 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Film className="text-rose-800" size={24} strokeWidth={1.5} />
                <h2 className="text-2xl font-serif italic text-white tracking-wide">
                  Recommended For You
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {relatedVideos.slice(10, 16).map((v) => (
                <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} prefetch={false} className="group flex flex-col">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                    <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                    <div className="absolute top-1.5 left-1.5 bg-rose-700/90 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                      HD
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                      {formatDuration(v.duration)}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col flex-grow">
                    <h3 className="font-light text-zinc-200 text-sm line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {v.title}
                    </h3>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px] mt-auto pt-1.5 font-medium">
                      <span>{Number(v.views || 0).toLocaleString()} views</span>
                      <span className="flex items-center gap-1 text-emerald-500"><ThumbsUp size={12} /> 98%</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* 💰 CAMOUFLAGED NATIVE ADS AT BOTTOM GRID */}
              {nativeAds.slice(1, 3).map((ad) => (
                <a key={ad.id} href={ad.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="group flex flex-col cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md border border-transparent group-hover:border-rose-900/50">
                    <img src={ad.thumbnail} alt={ad.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 bg-zinc-800 text-zinc-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                      AD
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      SPONSORED
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col flex-grow">
                    <h3 className="font-light text-zinc-300 text-sm line-clamp-2 group-hover:text-amber-500 transition-colors">
                      {ad.title}
                    </h3>
                    <div className="text-zinc-600 text-[10px] uppercase font-medium mt-auto pt-1.5">Promoted Content</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* =========================================
          💰 AD ZONE 6: BOTTOM LEADERBOARD
          ========================================= */}
      <div className="max-w-[1600px] mx-auto px-4 py-8 flex justify-center">
        <DirectBanner banners={blackedLeaderboards} format="banner-728x90" />
      </div>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505] w-full mt-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-2xl font-black tracking-tighter mb-4 flex items-center justify-center gap-1">
          <span className="text-rose-800 drop-shadow-sm">Porn</span>
          <span className="text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}