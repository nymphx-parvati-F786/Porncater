import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Tv, Play, ChevronLeft, ChevronRight } from "lucide-react";
import SmartHeader from "@/src/components/ui/SmartHeader";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import JsonLd from "@/src/components/json-ld";
import { getTopBannerAd } from "@/src/lib/ads";
import { listChannels } from "@/src/lib/channels";
import { MEGA_CATEGORIES, SITE_URL } from "@/src/lib/site";

export const revalidate = 120;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PER_PAGE = 36;

interface DirectoryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: DirectoryProps): Promise<Metadata> {
  const resolved = await searchParams;
  const letter = ((resolved.letter as string) || "").toUpperCase();
  const page = Math.max(1, parseInt(String(resolved.page || "1"), 10) || 1);
  const titleBase = letter ? `${letter} Porn Channels` : "Porn Channels & Studios";
  const title = page > 1 ? `${titleBase} - Page ${page}` : `${titleBase} - HD Clips & Trailers`;
  const description = letter
    ? `Browse ${letter} porn studios and premium adult channels. Watch free HD clips, trailers, and full scenes on PornCater.`
    : "Browse porn studio channels, premium networks, HD clips and trailers. Watch Blacked, Vixen, amateur studios and more on PornCater.";

  const params = new URLSearchParams();
  if (letter) params.set("letter", letter);
  if (page > 1) params.set("page", String(page));
  const canonical = `${SITE_URL}/channels${params.toString() ? `?${params}` : ""}`;

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
    },
  };
}

export default async function ChannelsDirectory({ searchParams }: DirectoryProps) {
  const resolved = await searchParams;
  const letter = ((resolved.letter as string) || "").toUpperCase();
  const q = ((resolved.q as string) || "").trim();
  const currentPage = Math.max(1, parseInt(String(resolved.page || "1"), 10) || 1);

  const [allChannels, topDesktopAd, topMobileAd] = await Promise.all([
    listChannels(),
    getTopBannerAd("970x70"),
    getTopBannerAd("300x100"),
  ]);

  let filtered = allChannels;
  if (letter) {
    filtered = filtered.filter((c) => c.studio.toUpperCase().startsWith(letter));
  }
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((c) => c.studio.toLowerCase().includes(needle));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const canonicalUrl = `${SITE_URL}/channels${letter ? `?letter=${letter}` : ""}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Porn Channels & Studios",
    url: canonicalUrl,
    numberOfItems: filtered.length,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Channels", item: `${SITE_URL}/channels` },
    ],
  };

  const buildUrl = (nextPage: number, nextLetter = letter) => {
    const params = new URLSearchParams();
    if (nextLetter) params.set("letter", nextLetter);
    if (q) params.set("q", q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return `/channels${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-rose-600 selection:text-white pb-2">
      <JsonLd data={[schema, breadcrumb]} />
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
              <Tv className="text-rose-600" size={24} strokeWidth={1.5} />
              <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide">
                Porn Channels
              </h1>
            </div>
            <span className="text-zinc-500 text-xs tracking-widest uppercase font-bold">
              {filtered.length.toLocaleString()} studios
            </span>
          </div>

          <p className="text-zinc-500 text-sm font-light mb-6 max-w-3xl">
            Studio channels, premium networks, clips and trailers. Tap a channel to binge their scenes.
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mb-8">
            <Link
              href="/channels"
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border ${
                !letter
                  ? "border-rose-700 bg-rose-900/30 text-rose-400"
                  : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
              }`}
            >
              All
            </Link>
            {alphabet.map((ch) => (
              <Link
                key={ch}
                href={buildUrl(1, ch)}
                className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold rounded-sm border ${
                  letter === ch
                    ? "border-rose-700 bg-rose-900/30 text-rose-400"
                    : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                }`}
              >
                {ch}
              </Link>
            ))}
          </div>

          {slice.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500 font-light tracking-wide text-lg">
                No channels found. Tag videos with a studio and they show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {slice.map((channel) => (
                <Link
                  key={channel.slug}
                  href={`/channels/${channel.slug}`}
                  prefetch={false}
                  className="group flex flex-col"
                >
                  <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md">
                    {channel.thumbnail ? (
                      <Image
                        src={channel.thumbnail}
                        alt={channel.studio}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition-transform duration-75 ease-out group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-rose-700/90 flex items-center justify-center">
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {channel.isNetwork ? (
                      <div className="absolute top-1.5 left-1.5 bg-rose-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                        Network
                      </div>
                    ) : (
                      <div className="absolute top-1.5 left-1.5 bg-zinc-950/80 backdrop-blur-sm text-zinc-200 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                        Channel
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                      <div className="font-serif italic text-white text-sm md:text-base truncate tracking-wide">
                        {channel.studio}
                      </div>
                      <div className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                        {channel.videoCount.toLocaleString()} videos
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 pt-8 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildUrl(page - 1)}
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
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={buildUrl(page + 1)}
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

        <div className="w-full flex justify-center my-1 overflow-hidden">
          <AdRotator />
        </div>
      </main>
    </div>
  );
}
