"use client";

import { useEffect, useState } from "react";

// The shape of your affiliate data
export interface AffiliateBanner {
  imageUrl: string;
  targetUrl: string;
  altText: string;
}

interface DirectBannerProps {
  banners: AffiliateBanner[];
  // Replaced 970x90 with 970x70
  format: "banner-300x250" | "banner-728x90" | "banner-970x70" | "banner-900x250"; 
  className?: string;
}

export default function DirectBanner({ banners, format, className = "" }: DirectBannerProps) {
  const [activeBanner, setActiveBanner] = useState<AffiliateBanner | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Pick a random banner on component mount to prevent Next.js hydration mismatch
    if (banners && banners.length > 0) {
      const randomIndex = Math.floor(Math.random() * banners.length);
      setActiveBanner(banners[randomIndex]);
    }
  }, [banners]);

  // Render a blank placeholder of the exact same size while calculating 
  // to prevent the page content from jumping around (Cumulative Layout Shift)
  if (!activeBanner) {
    return <div className={`my-6 ${className} opacity-0`} aria-hidden="true" />;
  }

  // Map the specific format to Tailwind responsive aspect ratios.
  // Using aspect ratios ensures the banner scales perfectly on mobile devices!
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
        className={`block relative ${dimensionsClasses} bg-zinc-950/50 border border-zinc-800/50 rounded-sm overflow-hidden group hover:border-rose-900/50 hover:shadow-[0_0_25px_rgba(225,29,72,0.15)] transition-all duration-500 w-full`}
      >
        {/* Loading Skeleton underneath the image */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
        )}

        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.altText}
          loading="lazy"
          // Force state to true if the image is already cached
          ref={(img) => {
            if (img && img.complete) {
              setIsImageLoaded(true);
            }
          }}
          onLoad={() => setIsImageLoaded(true)}
          // If the image breaks or is blocked, force reveal so it doesn't stay stuck at opacity-0
          onError={() => setIsImageLoaded(true)} 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${
            isImageLoaded ? "opacity-90 group-hover:opacity-100" : "opacity-0"
          }`}
        />
        
        {/* Aggressive Hover CTA Overlay for Maximum Conversions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
          <div className="flex justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <span className="bg-rose-800 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-6 py-2.5 sm:py-3 shadow-[0_0_15px_rgba(225,29,72,0.4)] rounded-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Watch Full Scene Now
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}