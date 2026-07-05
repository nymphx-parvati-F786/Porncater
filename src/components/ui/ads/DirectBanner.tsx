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

  // Notice: We removed the strict 'aspect-[]' classes! 
  // Now the container will stretch naturally to fit whatever image you feed it.
  let dimensionsClasses = "";
  switch (format) {
    case "banner-300x250":
      dimensionsClasses = "w-full max-w-[340px]";
      break;
    case "banner-728x90":
      dimensionsClasses = "w-full max-w-[800px]";
      break;
    case "banner-970x70":
      dimensionsClasses = "w-full max-w-[1050px]";
      break;
    case "banner-900x250":
      dimensionsClasses = "w-full max-w-[1000px]";
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center my-6 w-full ${className}`}>
      
      {/* The Clickable Ad Layer */}
      <a 
        href={activeBanner.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className={`block relative ${dimensionsClasses} bg-zinc-950 border border-zinc-800/50 rounded-sm overflow-hidden transition-colors duration-300`}
      >
        {/* Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse z-10" />
        )}

        {/* 
          1. Kept w-full and h-auto so the image pushes the container height naturally.
          2. Removed the group-hover:scale so the image never expands and gets cropped.
        */}
        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.altText}
          loading="lazy"
          ref={(img) => {
            if (img && img.complete) setIsImageLoaded(true);
          }}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)} 
          className={`block w-full h-auto transition-opacity duration-700 ease-out ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </a>
    </div>
  );
}