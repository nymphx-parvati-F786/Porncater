"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbyjuicy: any[];
  }
}

// Common JuicyAds dimension presets
const JUICY_PRESETS: Record<string, { width: number; height: number }> = {
  "300x262": { width: 300, height: 262 }, // Standard Rectangle
  "728x102": { width: 728, height: 102 }, // Leaderboard
  "908x270": { width: 908, height: 270 }, // Billboard / Big Banner
  "160x612": { width: 160, height: 612 }, // Skyscraper
};

interface JuicyAdsBannerProps {
  zoneId: string;
  preset?: "300x262" | "728x102" | "908x270" | "160x612";
  width?: number;
  height?: number;
  className?: string;
}

export default function JuicyAdsBanner({
  zoneId,
  preset = "300x262",
  width,
  height,
  className = "",
}: JuicyAdsBannerProps) {
  const selectedPreset = JUICY_PRESETS[preset] || JUICY_PRESETS["300x262"];
  const finalWidth = width || selectedPreset.width;
  const finalHeight = height || selectedPreset.height;

  // Push adzone to queue on mount or zoneId change
  useEffect(() => {
    try {
      window.adsbyjuicy = window.adsbyjuicy || [];
      window.adsbyjuicy.push({ adzone: parseInt(zoneId, 10) });
    } catch (err) {
      console.error("JuicyAds queue error:", err);
    }
  }, [zoneId]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden max-w-full ${className}`}
      style={{
        width: `${finalWidth}px`,
        minHeight: `${finalHeight}px`,
      }}
    >
      {/* 1. Reserved Space Skeleton (Prevents Cumulative Layout Shift) */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse -z-10 rounded-sm" />

      {/* 2. Single-instance Script Loader */}
      <Script
        id="juicyads-provider"
        strategy="lazyOnload"
        src="https://poweredby.jads.co/js/jads.js"
        data-cfasync="false"
      />

      {/* 3. Target Container */}
      <ins
        id={zoneId.toString()}
        data-width={finalWidth}
        data-height={finalHeight}
        className="z-10 block"
      />
    </div>
  );
}