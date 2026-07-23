"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    AdProvider: any[];
  }
}

// 🔥 LOCKED TO EXACT EXOCLICK FORMATS
const DIMENSION_PRESETS: Record<string, { width: string; height: string }> = {
  "300x250": { width: "300px", height: "250px" }, // Rectangle
  "728x90":  { width: "728px", height: "90px" },  // Leaderboard
  "160x600": { width: "160px", height: "600px" }, // Vertical Skyscraper
  "900x250": { width: "900px", height: "250px" }, // Banner
  "300x500": { width: "300px", height: "500px" }, // Banner
};

interface ExoClickBannerProps {
  zoneId: string;                                                         
  // TypeScript will now throw an error if you try to use an unsupported size
  dimension?: "300x250" | "728x90" | "160x600" | "900x250" | "300x500"; 
  width?: string;                                                         
  height?: string;                                                        
  className?: string;                                                     
}

export default function ExoClickBanner({
  zoneId,
  dimension = "300x250",
  width,
  height,
  className = "",
}: ExoClickBannerProps) {
  
  // Grab dimensions from the strict preset list
  const preset = DIMENSION_PRESETS[dimension];
  const finalWidth = width || preset.width;
  const finalHeight = height || preset.height;

  useEffect(() => {
    // Push the serve command to ExoClick's queue on mount
    try {
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch (err) {
      console.error("ExoClick serve trigger error:", err);
    }
  }, [zoneId]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden max-w-full ${className}`}
      style={{ width: finalWidth, minHeight: finalHeight }}
    >
      {/* Skeleton Loader - Prevents layout shifts */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse -z-10 rounded-sm" />

      <Script
        id={`exoclick-magsrv-provider-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
      />

      <ins
        className="eas6a97888e2 z-10 block"
        data-zoneid={zoneId}
      />
    </div>
  );
}