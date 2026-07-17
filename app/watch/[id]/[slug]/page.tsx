import { prisma } from "@/lib/prisma";
import { Metadata, ResolvingMetadata } from 'next';
import { Share2, Download, Sparkles, Film, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // 🔥 WE NEED THIS BAD BOY
import { notFound } from "next/navigation";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import AdSpace from "@/src/components/ui/ads/AdSpace";

// Import interactive client islands
import LikeButton from "@/src/components/ui/watch/LikeButton";
import ViewTracker from "@/src/components/ui/watch/ViewTracker";
import DirectBanner from "@/src/components/ui/ads/DirectBanner";
import { blackedSuperLeaderboards } from "@/src/data/adConfig";
import JuicyAd from "@/src/components/ui/ads/JuicyAdsBanner";
import ReportButton from "@/src/components/ui/watch/ReportButton";
import SearchBar from "@/src/components/ui/SearchBar";


interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

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
    return { title: 'Video Not Found | PornCater' };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { title: true, thumbnail: true, tags: true, status: true, pornstars: { select: { name: true } } }
  });

  if (!video) {
    return { title: 'Video Removed | PornCater' };
  }

  // 🔥 SEO INJECTION: If taken down, instantly tell crawlers to de-index the route
  if (video.status === "DMCA_TAKEDOWN") {
    return {
      title: "Content Unavailable - Copyright Restriction | PornCater",
      description: "Access to this performance asset has been disabled in compliance with regulatory copyright protocols.",
      robots: {
        index: false,
        follow: false,
        nocache: true,
      }
    };
  }

  const starNames = video.pornstars.map(s => s.name).join(', ');
  const tags = video.tags?.join(', ') || '';
  const seoKeywords = `${starNames}, ${tags}, ${video.title}, free porn, HD adult video, stream`;
  const seoDescription = `Watch ${video.title}${starNames ? ` featuring ${starNames}` : ''}. Stream exclusive HD adult cinema on PornCater.`;
  const canonicalUrl = `https://porncater.com/watch/${videoId}/${resolvedParams.slug}`;

  return {
    title: `${video.title} - PornCater`,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: video.title,
      description: seoDescription,
      url: canonicalUrl,
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

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      pornstars: { select: { id: true, name: true, avatarUrl: true, slug: true } }
    }
  });

  if (!video) notFound();

  // 🔥 SAFE CARRIAGE COMPLIANCE: If status is set to DMCA_TAKEDOWN, intercept and swap the UI frame
  if (video.status === "DMCA_TAKEDOWN") {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">

        {/* Navbar */}
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

        {/* Tombstone Frame */}
        <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <div className="border border-white/5 bg-[#0a0a0a] rounded-sm p-12 shadow-2xl flex flex-col items-center">
            <ShieldAlert className="text-rose-800 mb-6 animate-pulse" size={56} strokeWidth={1} />
            <h2 className="text-2xl font-serif italic text-white tracking-wide mb-4">
              Content Disabled Under Copyright Law
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8 font-light text-xs">
              Access to this high-definition media module has been permanently disabled in response to a formal notification of alleged copyright infringement submitted under the terms of the Digital Millennium Copyright Act (DMCA).
            </p>

            <div className="bg-black/50 border border-white/5 px-6 py-4 rounded-sm mb-8 w-full max-w-md text-left">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 block mb-1">Asset Information</span>
              <p className="text-zinc-300 text-xs font-mono truncate">{video.title}</p>
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 block mt-3 mb-1">Resolution Protocol</span>
              <p className="text-rose-700 text-xs font-mono font-medium">Status Code: 512(c) safe harbor validation active</p>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="bg-zinc-100 text-black px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300">
                Return to Directory
              </Link>
              <Link href="/dmca" className="border border-zinc-800 text-zinc-400 px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:border-zinc-600 hover:text-white transition-all duration-300">
                View Policy Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resolve recommendations while ignoring other disabled uploads
  const starIds = video.pornstars.map(s => s.id);
  const tags = video.tags || [];

  const [relatedVideos, topPornstars] = await Promise.all([
    prisma.video.findMany({
      where: {
        id: { not: videoId },
        status: "PUBLISHED", // 🛡️ CRITICAL SECURITY STEP: Filters takedowns from recommendations
        OR: [
          ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []),
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
        ]
      },
      take: 10,
      orderBy: { views: 'desc' },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true }
    }),
    prisma.pornstar.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, name: true, avatarUrl: true, views: true, slug: true }
    })
  ]);

  const uploadDate = new Date(video.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

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
    "name": video.title,
    "description": `Stream ${video.title} in HD format on PornCater.`,
    "thumbnailUrl": [video.thumbnail],
    "uploadDate": new Date(video.createdAt).toISOString(),
    "duration": isoDuration,
    "contentUrl": video.videoUrl,
    "embedUrl": `https://porncater.com/embed/${video.id}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": video.views || 0
    },
    "actor": video.pornstars.map(star => ({
      "@type": "PerformanceRole",
      "actor": {
        "@type": "Person",
        "name": star.name
      }
    }))
  };
  // 1. Format the primary category properly for Google's UI
  const rawCategory = video.tags && video.tags.length > 0 ? video.tags[0] : "Trending";
  // Capitalize the first letter so it looks professional in search results (e.g., "milf" -> "Milf")
  const primaryCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
  const categorySlug = rawCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 2. Build the Elite Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://porncater.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://porncater.com/category/" // Added trailing slash for canonical consistency
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": primaryCategory,
        "item": `https://porncater.com/category/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": video.title,
        // Using resolvedParams.slug guarantees the URL perfectly matches the current route
        "item": `https://porncater.com/watch/${video.id}/${resolvedParams.slug}` 
      }
    ]
  };

  // 3. Merge Schemas (Graph format)
  const combinedSchema = [jsonLdSchema, breadcrumbSchema];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      {/* 🔥 THE MASTER SEO GRAPH (Video + Breadcrumbs combined) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <ViewTracker videoId={video.id} />

      {/* Navbar */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
            </div>
          </div>

          <SearchBar />

          {/* Auth */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              Upload
            </Link>
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
                          <Link key={star.id} href={`/pornstars/${star.slug}`} className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full pr-3 py-0.5 transition-colors">
                            {/* 🔥 AVATARS: Fixed width/height optimization */}
                            <Image
                              src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                              alt={star.name}
                              width={24}
                              height={24}
                              className="rounded-full object-cover w-6 h-6"
                            />
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
                  <ReportButton videoId={video.id} />
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

              <DirectBanner
                banners={blackedSuperLeaderboards}
                format="banner-970x70"
                className="mb-10"
              />
            </div>
          </div>

          {/* RIGHT: Sidebar Module */}
          <div className="w-full lg:w-[32%]">
            {/* <AdSpace zoneId="5944198" format="banner-300x250" className="mb-8" /> */}
            {/* <AdSpace zoneId="5944198" format="banner-300x250" className="mb-8" />
            <div className="mb-8">
              <JuicyAd adZone="1122022" width="300" height="250" />
            </div> */}
            <h3 className="text-xl font-serif italic text-white mb-6">Up Next</h3>
            <div className="flex flex-col gap-5">
              {relatedVideos.length > 0 ? (
                relatedVideos.slice(0, 8).map((v) => (
                  <Link key={v.id} href={`/watch/${v.id}/${v.slug}`} className="group flex gap-4 cursor-pointer">
                    <div className="relative flex-shrink-0 bg-zinc-900 rounded-sm overflow-hidden w-[160px] aspect-video">
                      {/* 🔥 UP NEXT VIDEOS: Fixed 160px width layout optimization */}
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        sizes="160px"
                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out"
                      />
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
              <Link key={star.id} href={`/pornstars/${star.slug}`} className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]">
                {/* 🔥 FEATURED STARS: Responsive Grid Custom Sizes */}
                <Image
                  src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                  alt={star.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  className="object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
                />
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
                <Link key={vid.id} href={`/watch/${vid.id}/${vid.slug}`} className="group block cursor-pointer">
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {/* 🔥 MORE VIDEOS: Fully Lazy-loaded Next/Image component */}
                    <Image
                      src={vid.thumbnail}
                      alt={vid.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
                    />
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

        {/* Upgraded Footer with Legal Links */}
        <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
            <Link href="/dmca" className="hover:text-white transition duration-300">DMCA / Copyright</Link>
            <Link href="/privacy-policy" className="hover:text-white transition duration-300">Privacy Policy</Link>
            <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition duration-300">Terms of Service</Link>
            <Link href="/2257" className="hover:text-white transition duration-300">18 U.S.C. 2257</Link>
            <Link href="/contact" className="hover:text-white transition duration-300">Contact Us</Link>
          </div>

          <div className="text-xl tracking-widest mb-4">
            <span className="font-serif italic text-rose-800 pr-1">Porn</span>
            <span className="font-light text-zinc-600">Cater</span>
          </div>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-2xl mx-auto px-6 leading-relaxed mb-4">
            All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
          </p>
          <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} • Exclusive Adult Cinema • 18+ Only
          </p>
        </footer>
      </div>
    </div>
  );
}
