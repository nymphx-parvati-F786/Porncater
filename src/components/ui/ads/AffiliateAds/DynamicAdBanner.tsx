// components/AdBanner.tsx
"use client";

import { useState, useEffect } from "react";

interface AdBannerProps {
  desktopDimension?: string; // e.g., "970x70"
  mobileDimension?: string;  // e.g., "300x100" or "300x250"
  dimension?: string;        // Fallback single dimension
  targetStudio?: string;
  className?: string;
}

export default function AdBanner({
  desktopDimension = "970x70",
  mobileDimension = "300x100",
  dimension,
  targetStudio,
  className = "",
}: AdBannerProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      // 1. Detect if screen width is mobile (< 768px)
      const isMobile = window.innerWidth < 768;
      const activeDimension = dimension || (isMobile ? mobileDimension : desktopDimension);

      try {
        let url = `/api/ads?dimension=${activeDimension}`;
        if (targetStudio) {
          url += `&studio=${encodeURIComponent(targetStudio)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (error) {
        console.error("Failed to load ad banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [desktopDimension, mobileDimension, dimension, targetStudio]);

  if (loading || !ad) {
    return <div className={`animate-pulse bg-zinc-900/40 rounded-sm ${className}`} style={{ minHeight: "80px" }} />;
  }

  return (
    <div className={`overflow-hidden rounded-sm group relative block ${className}`}>
      <a 
        href={ad.trackingLink} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className="block w-full h-full relative active:scale-[0.98] transition-transform"
      >
        <img 
          src={ad.imageUrl} 
          alt="Promoted Creative" 
          className="w-full h-auto object-cover rounded-sm"
          loading="lazy"
        />
        <span className="absolute top-1 right-1 bg-black/80 text-zinc-400 text-[8px] uppercase tracking-widest px-1 rounded-[2px]">
          Ad
        </span>
      </a>
    </div>
  );
}