import { Metadata } from "next";
import Link from "next/link";
import { Tv } from "lucide-react";
import SmartHeader from "@/src/components/ui/SmartHeader";
import Pagination from "@/src/components/ui/Pagination";
import AdBanner from "@/src/components/ui/ads/AffiliateAds/DynamicAdBanner";
import AdRotator from "@/src/components/ui/ads/AdRotator/AdRotator";
import JsonLd from "@/src/components/json-ld";
import ChannelCard from "@/src/components/ui/ChannelCard";
import { getTopBannerAd } from "@/src/lib/ads";
import { featuredChannels, listChannels } from "@/src/lib/channels";
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
    : "Browse porn studio channels, premium networks, HD clips and trailers. Watch Blacked, Vixen, Team Skeet, Tushy and more on PornCater.";

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

  const premium = featuredChannels(allChannels, 12);

  let filtered = allChannels;
  if (letter) {
    filtered = filtered.filter((c) => c.studio.toUpperCase().startsWith(letter));
  }
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.studio.toLowerCase().includes(needle) ||
        c.niche.toLowerCase().includes(needle) ||
        c.program.toLowerCase().includes(needle),
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const showFeatured = !letter && !q && page === 1 && premium.length > 0;

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
            Premium networks, studio channels, clips and trailers. Pick a logo and binge.
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

          {showFeatured && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h2 className="text-xl font-serif italic text-white tracking-wide">
                  Premium Networks
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  Blacked · Vixen · Tushy · Team Skeet
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {premium.map((channel) => (
                  <ChannelCard key={`feat-${channel.slug}`} channel={channel} featured />
                ))}
              </div>
            </div>
          )}

          {slice.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500 font-light tracking-wide text-lg">
                No channels found.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h2 className="text-xl font-serif italic text-white tracking-wide">
                  {letter ? `${letter} Channels` : "All Studios"}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {slice.map((channel) => (
                  <ChannelCard key={channel.slug} channel={channel} />
                ))}
              </div>
            </>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hrefFor={(p) => buildUrl(p)}
          />
        </section>

        <div className="w-full flex justify-center my-1 overflow-hidden">
          <AdRotator />
        </div>
      </main>
    </div>
  );
}
