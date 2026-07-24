"use client";

import { useState, useEffect } from "react";

interface AdultForceBannerProps {
  spotId: string;        // e.g., "10002481"
  affiliateId?: string;  // e.g., "abhigyaansharma17"
  width?: number;        // e.g., 728
  height?: number;       // e.g., 90
  className?: string;
}

export default function AdultForceBanner({
  spotId,
  affiliateId = "abhigyaansharma17",
  width = 728,
  height = 90,
  className = "",
}: AdultForceBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");

  useEffect(() => {
    // Protocol safety for local dev vs production
    const protocol = window.location.protocol === "http:" ? "http:" : "https:";
    setIframeSrc(`${protocol}//a.adtng.com/get/${spotId}?ata=${affiliateId}`);
  }, [spotId, affiliateId]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-sm bg-[#0a0a0a] border border-zinc-900/50 ${className}`}
      style={{ 
        width: `${width}px`, 
        maxWidth: "100%", 
        minHeight: `${height}px` // Prevents Cumulative Layout Shift (CLS)
      }}
    >
      {/* Skeleton loader reserve space */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900/30 animate-pulse flex items-center justify-center z-0">
          <span className="text-zinc-700 text-[9px] uppercase font-bold tracking-widest">
            Sponsored Offer
          </span>
        </div>
      )}

      {/* AdultForce Iframe */}
      {iframeSrc && (
        <iframe
          title={`Advertisement Offer ${spotId}`} // Essential for GSC / Lighthouse accessibility
          name={`spot_id_${spotId}`}
          src={iframeSrc}
          width={width}
          height={height}
          scrolling="no"
          frameBorder="0"
        //   allowTransparency={true}
          loading="lazy" // Defers loading until scrolled into viewport
          onLoad={() => setIsLoaded(true)}
          className={`z-10 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundColor: "transparent" }}
        />
      )}

      {/* Native Sponsored Tag */}
      {/* <span className="absolute top-1 right-1 bg-black/80 text-zinc-500 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] border border-zinc-800 z-20 pointer-events-none">
        Ad
      </span> */}
    </div>
  );
}