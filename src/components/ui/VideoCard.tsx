import Link from "next/link";
import Image from "next/image";
import { ThumbsUp } from "lucide-react";
import { formatDuration, videoPath } from "@/src/lib/site";

export type VideoCardData = {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  duration?: string | number | null;
  views?: number | null;
  likes?: number | null;
};

export default function VideoCard({
  video,
  badge,
  compact = false,
}: {
  video: VideoCardData;
  badge?: "hd" | "new";
  compact?: boolean;
}) {
  const duration = formatDuration(video.duration);
  const views = Number(video.views || 0);
  const likes = Number(video.likes || 0);

  return (
    <Link
      href={videoPath(video.id, video.slug)}
      prefetch={false}
      className={
        compact
          ? "group flex flex-col bg-[#0a0a0a] border border-zinc-800 rounded-sm overflow-hidden hover:border-rose-900 transition-colors"
          : "group flex flex-col"
      }
    >
      <div className={`relative overflow-hidden bg-zinc-900 aspect-video ${compact ? "" : "shadow-md"}`}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 50vw, 20vw"
          className={`object-cover ${compact ? "group-hover:opacity-80 transition-opacity" : ""}`}
        />
        {badge === "new" ? (
          <div className="absolute top-1.5 left-1.5 bg-amber-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
            NEW
          </div>
        ) : (
          <div className="absolute top-1.5 left-1.5 bg-rose-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
            HD
          </div>
        )}
        {duration ? (
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
            {duration}
          </div>
        ) : null}
      </div>
      <div className={`${compact ? "p-2" : "mt-2"} flex flex-col flex-grow`}>
        <h3
          className={`${compact ? "text-xs leading-tight" : "text-sm leading-relaxed"} font-light text-zinc-200 line-clamp-2 group-hover:text-rose-600 transition-colors duration-75`}
        >
          {video.title}
        </h3>
        <div
          className={`flex items-center justify-between text-zinc-500 mt-auto ${compact ? "pt-2 text-[9px] uppercase tracking-widest font-bold" : "pt-1.5 text-[11px] font-medium"}`}
        >
          <span>{views.toLocaleString()} views</span>
          {likes > 0 ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <ThumbsUp size={compact ? 10 : 12} /> {likes.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
