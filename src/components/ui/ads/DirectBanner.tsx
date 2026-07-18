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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (banners && banners.length > 0) {
      setActiveBanner(banners[Math.floor(Math.random() * banners.length)]);
    }
  }, [banners]);

  if (!activeBanner) {
    return null;
  }

  // 🔥 SEO SHIELD & SCALING: We increase the max-width to enlarge the ad
  // but strictly lock the aspect ratio so it NEVER distorts or crops weirdly.
  let maxWClass = "max-w-[1100px]"; 
  let aspectClass = "aspect-[970/70]";

  switch (format) {
    case "banner-300x250":
      maxWClass = "max-w-[400px]"; // Scaled up from 300px
      aspectClass = "aspect-[300/250]";
      break;
    case "banner-728x90":
      maxWClass = "max-w-[900px]"; // Scaled up from 728px
      aspectClass = "aspect-[728/90]";
      break;
    case "banner-970x70":
      maxWClass = "max-w-[1200px]"; // Scaled up from 970px
      aspectClass = "aspect-[970/70]";
      break;
    case "banner-900x250":
      maxWClass = "max-w-[1100px]"; // Scaled up from 900px
      aspectClass = "aspect-[900/250]";
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <a 
        href={activeBanner.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer nofollow sponsored"
        // bg-black ensures any sub-pixel rendering stays dark, borders are removed for sleekness
        className={`block relative w-full bg-black overflow-hidden transition-all duration-300 shadow-lg ${maxWClass} ${aspectClass} group/ad`}
      >
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] animate-pulse">
            <span className="text-[9px] uppercase tracking-widest text-zinc-700 font-mono">Loading...</span>
          </div>
        )}

        {/* 
          Since the anchor tag forces the exact aspect ratio, we can safely use object-cover.
          It fills 100% of the box without cropping anything important!
        */}
        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.altText}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out group-hover/ad:brightness-110 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        
        <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md px-1 py-0.5 text-[6px] tracking-widest text-zinc-500 uppercase rounded-[2px] z-10 pointer-events-none">
          AD
        </div>
      </a>
    </div>
  );
}