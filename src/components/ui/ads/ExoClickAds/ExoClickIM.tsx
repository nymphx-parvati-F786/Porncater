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
      {/* 🔥 THE ISOLATION CHAMBER: Fixed positioning takes it completely out of the document flow. It literally CANNOT cause CLS. */}
      <div className={`fixed bottom-0 right-0 z-[9999] pointer-events-none ${className}`}>
        <ins
          className="eas6a97888e6 pointer-events-auto"
          data-zoneid={zoneId}
        />
      </div>
    </>
  );
}