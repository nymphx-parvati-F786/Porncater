"use client";

import Script from "next/script";

declare global {
  interface Window {
    AdProvider: any[];
  }
}

interface ExoClickIMProps {
  zoneId?: string;
  className?: string;
}

export default function ExoClickIM({
  zoneId = "5984398",
  className = "",
}: ExoClickIMProps) {
  // Trigger serve only after ad-provider.js has fully loaded
  const handleScriptLoad = () => {
    try {
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch (err) {
      console.error("ExoClick IM serve error:", err);
    }
  };

  return (
    <>
      <Script
        id={`exoclick-im-script-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
        onLoad={handleScriptLoad}
      />
      
      {/* 🔥 THE FIX: Removed the pointer-events trap and fixed positioning. 
          ExoClick's JS will automatically position this as a fixed chat bubble 
          and the close button will now perfectly register clicks. */}
      <div className={className}>
        <ins
          className="eas6a97888e6"
          data-zoneid={zoneId}
        />
      </div>
    </>
  );
}