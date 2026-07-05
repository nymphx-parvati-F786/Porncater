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

  // Increased max-widths to make the banners slightly bigger
  let dimensionsClasses = "";
  switch (format) {
    case "banner-300x250":
      dimensionsClasses = "w-full max-w-[340px] aspect-[6/5]";
      break;
    case "banner-728x90":
      dimensionsClasses = "w-full max-w-[800px] aspect-[728/90]";
      break;
    case "banner-970x70":
      dimensionsClasses = "w-full max-w-[1050px] aspect-[97/7]";
      break;
    case "banner-900x250":
      dimensionsClasses = "w-full max-w-[1000px] aspect-[18/5]";
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
      {/* Removed red hover effects, kept a clean subtle border lighten on hover */}
      <a 
        href={activeBanner.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className={`block relative ${dimensionsClasses} bg-zinc-950 border border-zinc-800/50 rounded-sm overflow-hidden group hover:border-zinc-700 transition-colors duration-300`}
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
          // Set to w-full and h-auto to completely eliminate cropping and black bars
          className={`block w-full h-auto transition-transform duration-700 ease-out ${
            isImageLoaded ? "opacity-100 group-hover:scale-[1.02]" : "opacity-0"
          }`}
        />
      </a>
    </div>
  );
}