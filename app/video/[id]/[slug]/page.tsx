import { prisma } from "@/lib/prisma";
import { Metadata, ResolvingMetadata } from "next";
import { ThumbsUp, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/src/components/json-ld";
import VideoCard from "@/src/components/ui/VideoCard";
import { getTopBannerAd } from "@/src/lib/ads";
import {
  MEGA_CATEGORIES,
  SITE_URL,
  categoryPath,
  channelPath,
  formatIsoDuration,
  videoAbsUrl,
} from "@/src/lib/site";

// Core Components
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";

// Interactive Client Islands
import LikeButton from "@/src/components/ui/watch/LikeButton";
import ViewTracker from "@/src/components/ui/watch/ViewTracker";
import ReportButton from "@/src/components/ui/watch/ReportButton";
import EmbedCodeGenerator from "@/src/components/ui/watch/EmbedCodeGenerator";

// Ad Units
import SmartHeader from "@/src/components/ui/SmartHeader";
import ExoClickBanner from "@/src/components/ui/ads/ExoClickAds/ExoClickBanner";
import JuicyAdsBanner from "@/src/components/ui/ads/JuicyAds/JuicyAdsBanner";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdultForceBanner from "@/src/components/ui/ads/AdultForceAds/AdultForceBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import ExoClickPopunder from "@/src/components/ui/ads/ExoClickAds/ExoClickPopunder"; // <-- ADD THI
import { rotatePage } from "@/src/lib/rotate";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export const revalidate = 120; // Revalidate dynamic watch page every 2 minutes

export async function generateMetadata(
  { params }: PageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id, 10);

  if (isNaN(videoId)) return { title: "Video Not Found" };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { title: true, slug: true, thumbnail: true, category: true, tags: true, status: true, pornstars: { select: { name: true } } }
  });

  if (!video) return { title: "Video Removed" };

  if (video.status === "DMCA_TAKEDOWN") {
    return {
      title: "Content Unavailable - DMCA Takedown",
      description: "Access to this video has been disabled in compliance with copyright regulations.",
      robots: { index: false, follow: false, nocache: true },
    };
  }

  const starNames = video.pornstars.map(s => s.name).join(', ');
  const tags = video.tags?.join(', ') || '';
  const seoKeywords = `${starNames}, ${tags}, ${video.category || ''}, ${video.title}, free HD porn, watch sex tube, adult video stream`;
  const seoDescription = `Watch ${video.title}${starNames ? ` starring ${starNames}` : ''} in full HD. Stream exclusive free porn scenes on PornCater.`;
  const canonicalUrl = videoAbsUrl(videoId, video.slug);

  return {
    title: `${video.title} - Free HD Porn`,
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

export default async function WatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id, 10);

  if (isNaN(videoId)) notFound();

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      pornstars: { select: { id: true, name: true, avatarUrl: true, slug: true, views: true } }
    }
  });

  if (!video) notFound();

  if (video.status !== "PUBLISHED") {
    notFound();
  }

  if (video.slug !== resolvedParams.slug) {
    permanentRedirect(`/video/${video.id}/${video.slug}`);
  }

  const starIds = video.pornstars.map(s => s.id);
  const tags = video.tags || [];

  // Build clean related video search conditions
  const relatedConditions: any[] = [];
  if (starIds.length > 0) relatedConditions.push({ pornstars: { some: { id: { in: starIds } } } });
  if (tags.length > 0) relatedConditions.push({ tags: { hasSome: tags } });

  const whereRelated = {
    id: { not: videoId },
    status: "PUBLISHED" as const,
    ...(relatedConditions.length > 0 ? { OR: relatedConditions } : {})
  };

  // Concurrent parallel data fetching including Top Banner Ads
  const [relatedPool, topPornstars, topDesktopAd, topMobileAd] = await Promise.all([
    prisma.video.findMany({
      where: whereRelated,
      take: 48,
      orderBy: { views: "desc" },
      select: { id: true, title: true, thumbnail: true, duration: true, views: true, likes: true, slug: true }
    }),
    prisma.pornstar.findMany({
      take: 8,
      orderBy: { views: "desc" },
      select: { id: true, name: true, avatarUrl: true, views: true, slug: true }
    }),
    getTopBannerAd("970x70"),
    getTopBannerAd("300x100")
  ]);
  const relatedVideos = rotatePage(relatedPool, 30, 0, 88 + videoId);

  const uploadDateFormatted = new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const canonicalUrl = videoAbsUrl(video.id, video.slug);
  const isoDuration = formatIsoDuration(video.duration);
  const starNames = video.pornstars.map((s) => s.name).join(", ");

  const jsonLdSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `Watch ${video.title}${starNames ? ` starring ${starNames}` : ""} in HD on PornCater.`,
    thumbnailUrl: [video.thumbnail],
    uploadDate: new Date(video.createdAt).toISOString(),
    embedUrl: `${SITE_URL}/embed/${video.id}`,
    isFamilyFriendly: false,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views || 0,
    },
  };
  if (isoDuration) jsonLdSchema.duration = isoDuration;
  if (video.pornstars.length > 0) {
    jsonLdSchema.actor = video.pornstars.map((star) => ({
      "@type": "Person",
      name: star.name,
      url: `${SITE_URL}/pornstars/${star.slug}`,
    }));
  }

  const categoryName = video.category || (tags[0] ? tags[0] : "Adult");
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: categoryName, item: `${SITE_URL}${categoryPath(categoryName)}` },
      { "@type": "ListItem", position: 3, name: video.title, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      {/* Inject Structured Data */}
      <JsonLd data={[jsonLdSchema, breadcrumbSchema]} />
      <ViewTracker videoId={video.id} />

      <SmartHeader categories={[...MEGA_CATEGORIES]} />

      <main>
        {/* 🔥 THE INVISIBLE MONEY MAKER 🔥 */}
        <ExoClickPopunder desktopZoneId="5998588" mobileZoneId="5998592" />
        {/* TOP DYNAMIC AFFILIATE BANNER (Server-Injected for 0ms LCP) */}
        <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2 flex justify-center">
          <AdBanner
            dimension="970x70"
            priority={true}
            initialAd={topDesktopAd}
            className="hidden md:block w-full max-w-[970px]"
          />
          <AdBanner
            dimension="300x100"
            priority={true}
            initialAd={topMobileAd}
            className="block md:hidden mx-auto"
          />
        </div>

        {/* WATCH PAGE 2-COLUMN LAYOUT */}
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-2 flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* LEFT COLUMN: PLAYER & DETAILS */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Video Player */}
            <div className="w-full bg-black aspect-video rounded-sm overflow-hidden border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <VideoPlayer
                key={video.id}
                src={video.videoUrl}
                poster={video.thumbnail}
                title={video.title}
                vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5984924"
              />
            </div>

            {/* Video Details Block */}
            <div className="bg-[#111] border border-zinc-800 p-3 md:p-4 rounded-sm">
              <h1 className="text-xl md:text-2xl font-medium text-white leading-tight mb-3 break-words">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5 text-[11px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">
                  <span className="flex items-center gap-1 text-emerald-500"><ThumbsUp size={14} /> {Number(video.likes || 0).toLocaleString()}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} /> {Number(video.views || 0).toLocaleString()}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-zinc-500" /> {uploadDateFormatted}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <LikeButton videoId={video.id} />
                  <EmbedCodeGenerator videoId={video.id} videoTitle={video.title} />
                  <ReportButton videoId={video.id} />
                </div>
              </div>

              {/* Meta: Stars & Tags */}
              <div className="pt-3 flex flex-col gap-2">
                {video.studio ? (
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase">Channel:</span>
                    <Link href={channelPath(video.studio)} className="text-rose-500 hover:text-rose-400 text-xs font-bold transition">
                      {video.studio}
                    </Link>
                  </div>
                ) : null}
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

            {/* BELOW-PLAYER AD BANNER ROTATOR */}
            <div className="w-full flex justify-start my-1 overflow-hidden">
              <AdRotator />
            </div>

          </div>

          {/* RIGHT COLUMN: STACKED SIDEBAR ADS (STICKY DESKTOP) */}
          <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 mx-auto lg:mx-0 lg:sticky lg:top-20 h-fit">

            {/* Ad 1 */}
            <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto rounded-sm flex justify-center items-center">
              <ExoClickBanner dimension="300x250" zoneId="5984388" />
            </div>

            {/* Ad 2 */}
            <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto rounded-sm flex justify-center items-center hidden sm:flex">
              <AdultForceBanner spotId="10001807" width={300} height={250} className="mx-auto" />
            </div>

            {/* Ad 3 */}
            <div className="w-[300px] h-[250px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto rounded-sm flex justify-center items-center hidden md:flex">
              <ExoClickBanner dimension="300x250" zoneId="5984390" />
            </div>

            {/* Ad 4 */}
            <div className="w-[300px] h-[262px] bg-zinc-900 border border-zinc-800 overflow-hidden mx-auto rounded-sm flex justify-center items-center hidden lg:flex">
              <JuicyAdsBanner zoneId="1122799" width={300} height={262} className="mx-auto" />
            </div>

          </div>

        </div>

        {/* RELATED SECTION & STARS */}
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-6">

          {/* FEATURED STARS */}
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

          {/* RELATED VIDEOS GRID */}
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2 ml-1">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white flex items-center gap-2">
              Related Videos
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {relatedVideos.map((v) => (
              <VideoCard key={v.id} video={v} compact />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}