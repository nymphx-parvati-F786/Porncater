import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Flame, Clock, Sparkles, Tv } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import VideoCard from "@/src/components/ui/VideoCard";
import JsonLd from "@/src/components/json-ld";
import { getTopBannerAd } from "@/src/lib/ads";
import { MEGA_CATEGORIES, SITE_URL, videoAbsUrl } from "@/src/lib/site";
import { featuredChannels as pickFeatured, listChannels } from "@/src/lib/channels";
import ChannelCard from "@/src/components/ui/ChannelCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "PornCater | Free HD Porn Videos & Sexy Porn Scenes",
  },
  description:
    "Watch the best free HD porn videos, featuring top pornstars and exclusive premium porn tube scenes. Updated daily with fresh, high-quality sex tube scenes.",
  keywords: "free porn, HD porn videos, sex tube, adult cinema, pornstars, XXX movies",
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: "PornCater | Free HD Porn Videos",
    description: "Stream exclusive HD porn videos and trending porn scenes.",
    url: `${SITE_URL}/`,
    siteName: "PornCater",
    type: "website",
  },
};

export default async function Home() {
  const [trendingVideos, latestVideos, topPornstars, topChannels] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: 24,
      orderBy: { views: "desc" },
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
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: 18,
      orderBy: { createdAt: "desc" },
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
    prisma.pornstar.findMany({
      take: 12,
      orderBy: { views: "desc" },
      select: { id: true, slug: true, name: true, avatarUrl: true, views: true },
    }),
    listChannels(),
  ]);
  const premiumChannels = pickFeatured(topChannels, 12);

  const [topDesktopAd, topMobileAd] = await Promise.all([
    getTopBannerAd("970x70"),
    getTopBannerAd("300x100"),
  ]);

  const trendingItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending Porn Videos",
    url: `${SITE_URL}/trending`,
    itemListElement: trendingVideos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: videoAbsUrl(video.id, video.slug),
      name: video.title,
      image: video.thumbnail,
    })),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      <JsonLd data={trendingItemListSchema} />
      <h1 className="sr-only">Free HD Porn Videos & Premium Adult Cinema - PornCater</h1>

      <SmartHeader categories={[...MEGA_CATEGORIES]} />

      <main>
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

        <section className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-3">
              <Flame className="text-rose-600" size={24} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-white tracking-wide">
                Trending Porn Videos
              </h2>
            </div>
            <Link
              href="/trending"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-sm text-xs font-bold uppercase transition border border-zinc-800"
            >
              See All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {trendingVideos.map((video) => (
              <VideoCard key={video.id} video={video} badge="hd" />
            ))}
          </div>
        </section>

        <section className="bg-[#0c0c0c] border-y border-zinc-900/50">
          <div className="max-w-[1600px] mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-3">
                <Clock className="text-amber-600" size={24} strokeWidth={1.5} />
                <h2 className="text-2xl font-serif italic text-white tracking-wide">
                  Latest Porn Videos
                </h2>
              </div>
              <Link
                href="/latest"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-sm text-xs font-bold uppercase transition border border-zinc-800"
              >
                See All
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {latestVideos.map((video) => (
                <VideoCard key={video.id} video={video} badge="new" />
              ))}
            </div>
          </div>
        </section>

        {/* <section className="max-w-[1600px] mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-500" size={24} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-white tracking-wide">
                Top Pornstars
              </h2>
            </div>
            <Link
              href="/pornstars"
              className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest transition"
            >
              A-Z Index
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {topPornstars.map((star) => (
              <Link
                key={star.id}
                href={`/pornstars/${star.slug}`}
                prefetch={false}
                className="group flex items-center gap-3 bg-[#111] hover:bg-zinc-900 border border-zinc-800/80 hover:border-rose-900/50 p-1.5 pr-4 transition-all duration-75 shadow-sm"
              >
                <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden shrink-0 border border-zinc-700/50 group-hover:border-rose-500/50 transition-colors duration-300">
                  <Image
                    src={star.avatarUrl || "/thumbnails/default-avatar.png"}
                    alt={star.name}
                    fill
                    sizes="48px"
                    className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                  />
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

        {premiumChannels.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-3">
                <Tv className="text-rose-600" size={24} strokeWidth={1.5} />
                <h2 className="text-2xl font-serif italic text-white tracking-wide">
                  Premium Channels
                </h2>
              </div>
              <Link
                href="/channels"
                className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-widest transition"
              >
                All Channels
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {premiumChannels.map((channel) => (
                <ChannelCard key={channel.slug} channel={channel} featured />
              ))}
            </div>
          </section>
        )} */}

        <div className="w-full flex justify-center my-1 overflow-hidden">
          <AdRotator />
        </div>
      </main>
    </div>
  );
}
