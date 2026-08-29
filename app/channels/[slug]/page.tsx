import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Tv,
  Play,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import VideoCard from "@/src/components/ui/VideoCard";
import ChannelCard, { ChannelLogo } from "@/src/components/ui/ChannelCard";
import JsonLd from "@/src/components/json-ld";
import { getTopBannerAd } from "@/src/lib/ads";
import { getChannelBySlug, listChannels } from "@/src/lib/channels";
import {
  MEGA_CATEGORIES,
  SITE_URL,
  channelPath,
  isTrailerDuration,
} from "@/src/lib/site";

export const revalidate = 120;

const PER_PAGE = 24;

interface ChannelProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: ChannelProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await searchParams;
  const page = Math.max(1, parseInt(String(resolved.page || "1"), 10) || 1);
  const channel = await getChannelBySlug(slug);
  if (!channel) return { title: "Channel Not Found" };

  const title =
    page > 1
      ? `${channel.studio} Porn Videos - Page ${page}`
      : `${channel.studio} Channel - Free HD Clips & Trailers`;
  const nicheBit = channel.niche ? ` ${channel.niche}.` : "";
  const description = `Watch free ${channel.studio} porn videos, HD clips and trailers on PornCater.${nicheBit} ${channel.videoCount.toLocaleString()} scenes from the ${channel.studio} studio channel.`;
  const canonical = `${SITE_URL}${channelPath(channel.slug)}${page > 1 ? `?page=${page}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "PornCater",
      type: "website",
      images: channel.thumbnail ? [{ url: channel.thumbnail }] : undefined,
    },
  };
}

export default async function ChannelPage({ params, searchParams }: ChannelProps) {
  const { slug } = await params;
  const resolved = await searchParams;
  const currentPage = Math.max(1, parseInt(String(resolved.page || "1"), 10) || 1);
  const sort = (resolved.sort as string) === "newest" ? "newest" : "popular";

  const channel = await getChannelBySlug(slug);
  if (!channel) notFound();

  const skip = (currentPage - 1) * PER_PAGE;
  const studioFilter = {
    status: "PUBLISHED" as const,
    studio: { equals: channel.studio, mode: "insensitive" as const },
  };

  let [videos, totalCount, topDesktopAd, topMobileAd, related] = await Promise.all([
    prisma.video.findMany({
      where: studioFilter,
      take: PER_PAGE,
      skip,
      orderBy: sort === "newest" ? { createdAt: "desc" } : { views: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        duration: true,
        views: true,
        likes: true,
      },
    }),
    prisma.video.count({ where: studioFilter }),
    getTopBannerAd("970x70", channel.studio),
    getTopBannerAd("300x100", channel.studio),
    listChannels(),
  ]);

  let usedTitleFallback = false;
  if (totalCount === 0) {
    usedTitleFallback = true;
    const titleFilter = {
      status: "PUBLISHED" as const,
      title: { contains: channel.studio, mode: "insensitive" as const },
    };
    const [fallbackVideos, fallbackCount] = await Promise.all([
      prisma.video.findMany({
        where: titleFilter,
        take: PER_PAGE,
        skip,
        orderBy: sort === "newest" ? { createdAt: "desc" } : { views: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          duration: true,
          views: true,
          likes: true,
        },
      }),
      prisma.video.count({ where: titleFilter }),
    ]);
    videos = fallbackVideos;
    totalCount = fallbackCount;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const relatedChannels = related.filter((c) => c.slug !== channel.slug).slice(0, 12);
  const trailers = videos.filter((v) => isTrailerDuration(v.duration));
  const fullScenes = videos.filter((v) => !isTrailerDuration(v.duration));
  const canonicalUrl = `${SITE_URL}${channelPath(channel.slug)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${channel.studio} Porn Channel`,
    url: canonicalUrl,
    description: `Free ${channel.studio} HD porn clips and trailers.`,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Channels", item: `${SITE_URL}/channels` },
      { "@type": "ListItem", position: 3, name: channel.studio, item: canonicalUrl },
    ],
  };

  const buildPageUrl = (pageNum: number, nextSort = sort) => {
    const params = new URLSearchParams();
    if (nextSort !== "popular") params.set("sort", nextSort);
    if (pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return `/channels/${channel.slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      <JsonLd data={[schema, breadcrumb]} />
      <SmartHeader categories={[...MEGA_CATEGORIES]} />

      <main>
        <div className="relative w-full min-h-[240px] md:min-h-[320px] overflow-hidden border-b border-zinc-800">
          {channel.thumbnail ? (
            <Image
              src={channel.thumbnail}
              alt={channel.studio}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-[#111]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/75 to-black/40" />
          <div className="relative max-w-[1600px] mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-4 md:gap-5">
              <ChannelLogo name={channel.studio} size="lg" />
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  <Tv size={14} className="text-rose-600" />
                  <Link href="/channels" className="hover:text-white">
                    Channels
                  </Link>
                  <span className="text-zinc-700">/</span>
                  <span>{channel.siteType || "Studio Channel"}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif italic text-white tracking-wide mb-2">
                  {channel.studio}
                </h1>
                {channel.niche ? (
                  <p className="text-zinc-400 text-sm font-light mb-3">{channel.niche}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest font-bold text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Play size={14} className="text-rose-500" /> {totalCount.toLocaleString()} videos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} /> {channel.totalViews.toLocaleString()} views
                  </span>
                  {channel.program ? (
                    <span className="text-zinc-600">{channel.program}</span>
                  ) : null}
                </div>
              </div>
            </div>
            {channel.officialUrl ? (
              <a
                href={channel.officialUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition"
              >
                Visit Official Site <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 pt-4 pb-2 flex justify-center">
          <AdBanner
            dimension="970x70"
            priority={true}
            initialAd={topDesktopAd}
            targetStudio={channel.studio}
            className="hidden md:block w-full max-w-[970px]"
          />
          <AdBanner
            dimension="300x100"
            priority={true}
            initialAd={topMobileAd}
            targetStudio={channel.studio}
            className="block md:hidden mx-auto"
          />
        </div>

        {currentPage === 1 && trailers.length > 0 && fullScenes.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 pt-6">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <h2 className="text-xl font-serif italic text-white tracking-wide">Trailers</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {trailers.slice(0, 6).map((video) => (
                <VideoCard key={`tr-${video.id}`} video={video} compact />
              ))}
            </div>
          </section>
        )}

        <section className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2 gap-3">
            <h2 className="text-2xl font-serif italic text-white tracking-wide">
              {usedTitleFallback ? `${channel.studio} Clips & Trailers` : `${channel.studio} Videos`}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <Link
                href={buildPageUrl(1, "popular")}
                className={sort === "popular" ? "text-rose-500" : "text-zinc-500 hover:text-white"}
              >
                Popular
              </Link>
              <span className="text-zinc-700">/</span>
              <Link
                href={buildPageUrl(1, "newest")}
                className={sort === "newest" ? "text-rose-500" : "text-zinc-500 hover:text-white"}
              >
                Newest
              </Link>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="py-16 text-center border border-zinc-900 rounded-sm bg-[#0c0c0c]">
              <p className="text-zinc-500 font-light tracking-wide text-lg mb-4">
                No free scenes tagged for {channel.studio} yet.
              </p>
              {channel.officialUrl ? (
                <a
                  href={channel.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest"
                >
                  Watch on {channel.studio} <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {(fullScenes.length > 0 && trailers.length > 0 ? fullScenes : videos).map((video) => (
                <VideoCard key={video.id} video={video} badge="hd" />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 pt-8 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white transition-all rounded-sm mr-2"
                >
                  <ChevronLeft size={16} />
                </Link>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-zinc-900/20 border border-zinc-900 text-zinc-700 rounded-sm mr-2">
                  <ChevronLeft size={16} />
                </div>
              )}
              <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold px-3">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white transition-all rounded-sm ml-2"
                >
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-zinc-900/20 border border-zinc-900 text-zinc-700 rounded-sm ml-2">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          )}
        </section>

        {relatedChannels.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
              <h2 className="text-2xl font-serif italic text-white tracking-wide">More Channels</h2>
              <Link
                href="/channels"
                className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest"
              >
                All Channels
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedChannels.map((c) => (
                <ChannelCard key={c.slug} channel={c} />
              ))}
            </div>
          </section>
        )}

        <div className="w-full flex justify-center my-1 overflow-hidden">
          <AdRotator />
        </div>
      </main>
    </div>
  );
}
