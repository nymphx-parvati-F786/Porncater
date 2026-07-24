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
      {/* 1. Loads ExoClick in the background so your 4K videos load first */}
      <Script
        id={`exoclick-sticky-script-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
        onLoad={handleScriptLoad}
      />

      {/* 
        2. The Anchor Tag.
        We do NOT use 'hidden' or 'display: none' here, otherwise ExoClick thinks 
        the ad is invisible and aborts the render. We just let it sit quietly 
        in the DOM while ExoClick's JS forces it to be a fixed sticky overlay.
      */}
      <div className={className} aria-hidden="true">
        <ins
          className="eas6a97888e17 block"
          data-zoneid={zoneId}
        />
      </div>
    </>
  );
}