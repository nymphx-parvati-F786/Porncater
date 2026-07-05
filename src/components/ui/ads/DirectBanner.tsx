"use client";

import { useEffect, useState } from "react";

export interface AffiliateBanner {
  imageUrl: string;
  targetUrl: string;
  altText: string;
}

interface DirectBannerProps {
  banners: AffiliateBanner[];
  format: "banner-300x250" | "banner-728x90" | "banner-970x70" | "banner-900x250";
  className?: string;
}

export default function DirectBanner({ banners, format, className = "" }: DirectBannerProps) {
  const [activeBanner, setActiveBanner] = useState<AffiliateBanner | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (banners && banners.length > 0) {
      const randomIndex = Math.floor(Math.random() * banners.length);
      setActiveBanner(banners[randomIndex]);
    }
  }, [banners]);

  if (!activeBanner) {
    return <div className={`my-6 ${className} opacity-0`} aria-hidden="true" />;
  }

  let dimensionsClasses = "";
  switch (format) {
    case "banner-300x250":
      dimensionsClasses = "w-full max-w-[300px] aspect-[6/5]";
      break;
    case "banner-728x90":
      dimensionsClasses = "w-full max-w-[728px] aspect-[728/90]";
      break;
    case "banner-970x70":
      dimensionsClasses = "w-full max-w-[970px] aspect-[97/7]";
      break;
    case "banner-900x250":
      dimensionsClasses = "w-full max-w-[900px] aspect-[18/5]";
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center my-6 w-full ${className}`}>
      {/* Stealthy / Premium Label */}
      <div className="flex items-center gap-2 mb-2 w-full max-w-max">
        <span className="w-2 h-[1px] bg-zinc-700"></span>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">
          Sponsored Content
        </span>
        <span className="w-2 h-[1px] bg-zinc-700"></span>
      </div>
      
      {/* The Clickable Ad Layer */}
      <a 
        href={activeBanner.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className={`block relative ${dimensionsClasses} bg-black border border-zinc-800/50 rounded-sm overflow-hidden group hover:border-rose-900/50 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)] transition-all duration-300 w-full`}
      >
        {/* Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
        )}

        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.altText}
          loading="lazy"
          ref={(img) => {
            if (img && img.complete) setIsImageLoaded(true);
          }}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)} 
          // 🔥 CHANGED: object-contain prevents ANY cutting of the image.
          className={`absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02] ${
            isImageLoaded ? "opacity-90 group-hover:opacity-100" : "opacity-0"
          }`}
        />
        
        {/* 🔥 CHANGED: Static, always-visible Watch Now button */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 pointer-events-none z-10">
          <span className="bg-rose-800 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_10px_rgba(0,0,0,0.8)] rounded-sm flex items-center gap-2 border border-rose-600/50 group-hover:bg-rose-700 transition-colors">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            Watch Now
          </span>
        </div>
      </a>
    </div>
  );
}