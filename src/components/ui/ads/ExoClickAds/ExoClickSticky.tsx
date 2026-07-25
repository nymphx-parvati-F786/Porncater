"use client";

import Script from "next/script";

declare global {
  interface Window {
    AdProvider: any[];
  }
}

interface ExoClickStickyProps {
  zoneId?: string;
  className?: string;
}

export default function ExoClickSticky({
  zoneId = "5984712", // Your new Sticky Zone ID
  className = "",
}: ExoClickStickyProps) {

  // 🔥 Pro-Move: Only push the ad request AFTER the script finishes downloading
  const handleScriptLoad = () => {
    try {
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch (err) {
      console.error("ExoClick Sticky serve error:", err);
    }
  };

  return (
    <>
      <Script
        id={`exoclick-sticky-script-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
        onLoad={handleScriptLoad}
      />
      {/* 🔥 Fixed to the bottom center, immune to layout shifts */}
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none ${className}`} aria-hidden="true">
        <ins
          className="eas6a97888e17 block pointer-events-auto"
          data-zoneid={zoneId}
        />
      </div>
    </>
  );
}