import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ChannelCard as ChannelData } from "@/src/lib/channels";

function ChannelMark({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const letter = (name.match(/[A-Za-z0-9]/)?.[0] || "P").toUpperCase();
  const box =
    size === "lg"
      ? "w-16 h-16 md:w-[72px] md:h-[72px] text-3xl"
      : size === "sm"
        ? "w-9 h-9 text-lg"
        : "w-12 h-12 md:w-14 md:h-14 text-2xl";

  return (
    <div
      className={`${box} shrink-0 rounded-sm border border-white/25 bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.55)]`}
    >
      <span className="font-serif italic text-white leading-none">{letter}</span>
    </div>
  );
}

export default function ChannelCard({
  channel,
  featured = false,
}: {
  channel: ChannelData;
  featured?: boolean;
}) {
  return (
    <Link
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
            sizes={featured ? "(max-width: 640px) 50vw, 25vw" : "(max-width: 640px) 50vw, 20vw"}
            className="object-cover transition-transform duration-75 ease-out group-hover:scale-[1.01]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ChannelMark name={channel.studio} size={featured ? "lg" : "md"} />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-rose-700/90 flex items-center justify-center shadow-lg">
            <Play size={16} className="text-white fill-white ml-0.5" />
          </div>
        </div>

        {channel.tier === "S" || channel.isNetwork ? (
          <div className="absolute top-1.5 left-1.5 bg-rose-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
            {channel.tier === "S" ? "Premium" : "Network"}
          </div>
        ) : channel.siteType ? (
          <div className="absolute top-1.5 left-1.5 bg-zinc-950/80 backdrop-blur-sm text-zinc-200 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
            {channel.siteType}
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] md:text-[10px] text-zinc-300 font-bold uppercase tracking-widest truncate">
              {channel.niche || `${channel.videoCount.toLocaleString()} videos`}
            </span>
            {channel.videoCount > 0 ? (
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest shrink-0">
                {channel.videoCount.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ChannelLogo({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return <ChannelMark name={name} size={size} />;
}
