"use client";

import Script from "next/script";

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

  // 🔥 Trigger serve ONLY after the script script is loaded and ready
  const handleScriptLoad = () => {
    try {
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch (err) {
      console.error("ExoClick serve trigger error:", err);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden max-w-full ${className}`}
      style={{ width: finalWidth, minHeight: finalHeight }}
    >
      {/* Skeleton Loader for CLS */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse -z-10 rounded-sm" />

      <Script
        id={`exoclick-magsrv-provider-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
        onLoad={handleScriptLoad}
      />

      <ins
        className="eas6a97888e2 z-10 block"
        data-zoneid={zoneId}
      />
    </div>
  );
}