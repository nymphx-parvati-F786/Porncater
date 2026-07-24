"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    AdProvider: any[];
  }
}

const DIMENSION_PRESETS: Record<string, { width: string; height: string }> = {
  "300x250": { width: "300px", height: "250px" },
  "728x90":  { width: "728px", height: "90px" },
  "160x600": { width: "160px", height: "600px" },
  "900x250": { width: "900px", height: "250px" },
  "300x500": { width: "300px", height: "500px" },
};

interface ExoClickBannerProps {
  zoneId: string;
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
  const preset = DIMENSION_PRESETS[dimension] || DIMENSION_PRESETS["300x250"];
  const finalWidth = width || preset.width;
  const finalHeight = height || preset.height;

  // 🔥 THE SPA FIX: useEffect runs on every single route change, 
  // guaranteeing the ad requests a fresh impression when they click a new video.
  useEffect(() => {
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
      {/* Skeleton Loader for CLS */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse -z-10 rounded-sm" />

      {/* 🔥 STATIC ID FIX: Tells Next.js to only inject this engine ONCE globally */}
      <Script
        id="exoclick-magsrv-provider-global"
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