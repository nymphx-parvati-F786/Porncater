"use client";

import Script from "next/script";
import { useEffect } from "react";

// Prevent TypeScript from yelling about JuicyAds' custom window variable
declare global {
  interface Window {
    adsbyjuicy: any[];
  }
}

interface JuicyAdsBannerProps {
  zoneId: string;      // e.g. "1122799"
  width?: number;      // e.g. 300
  height?: number;     // e.g. 262
  className?: string;  // Tailwind classes for positioning
}

export default function JuicyAdsBanner({
  zoneId,
  width = 300,
  height = 262, // Defaulting to JuicyAds' unique rectangle size
  className = "",
}: JuicyAdsBannerProps) {
  
  useEffect(() => {
    // When the component mounts or zoneId changes, trigger the ad
    try {
      window.adsbyjuicy = window.adsbyjuicy || [];
      window.adsbyjuicy.push({ adzone: parseInt(zoneId, 10) });
    } catch (err) {
      console.error("JuicyAds load error:", err);
    }
  }, [zoneId]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden max-w-full ${className}`}
      style={{ width: `${width}px`, minHeight: `${height}px` }}
    >
      {/* 1. SEO CLS Skeleton Loader (Prevents page jumps) */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse -z-10 rounded-sm" />

      {/* 2. JuicyAds Async Script Loader (lazyOnload protects video player speed) */}
      <Script
        id="juicyads-provider"
        strategy="lazyOnload"
        src="https://poweredby.jads.co/js/jads.js"
        data-cfasync="false"
      />

      {/* 3. The Target Container JuicyAds looks for */}
      <ins
        id={zoneId.toString()}
        data-width={width}
        data-height={height}
        className="z-10 block"
      />
    </div>
  );
}