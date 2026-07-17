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

  // 🔥 SEO SHIELD: Calculate exact aspect ratios to reserve physical space instantly
  let maxWidth = "300px";
  let aspectRatio = "300/250";
  
  switch (format) {
    case "banner-300x250":
      maxWidth = "300px"; aspectRatio = "300/250"; break;
    case "banner-728x90":
      maxWidth = "728px"; aspectRatio = "728/90"; break;
    case "banner-970x70":
      maxWidth = "970px"; aspectRatio = "970/70"; break;
    case "banner-900x250":
      maxWidth = "900px"; aspectRatio = "900/250"; break;
  }

  return (
    <div className={`flex flex-col items-center justify-center my-8 w-full ${className}`}>
      <a 
        href={activeBanner.targetUrl} 
        target="_blank" 
        // 🛡️ THE HOLY TRINITY OF AD SEO: Protects your domain authority
        rel="noopener noreferrer nofollow sponsored"
        className="block relative w-full bg-zinc-950/50 border border-zinc-800/50 rounded-sm overflow-hidden transition-colors hover:border-rose-800 shadow-lg"
        style={{ maxWidth, aspectRatio }}
      >
        {/* Loading Skeleton ensures the box isn't an ugly blank space */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 animate-pulse">
            <span className="text-[9px] uppercase tracking-widest text-zinc-700 font-mono">Sponsor</span>
          </div>
        )}

        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.altText}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        
        <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[7px] tracking-widest text-zinc-500 uppercase rounded-sm z-10 pointer-events-none">
          AD
        </div>
      </a>
    </div>
  );
}