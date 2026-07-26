"use client";

import { useEffect } from "react";
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

  // 🔥 THE FIX: This ensures the ad fires every time the user navigates to a new page,
  // even if the ad-provider.js script is already cached by Next.js!
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.AdProvider = window.AdProvider || [];
      // We wrap it in a try-catch so ad-blockers don't crash your React tree
      try {
        window.AdProvider.push({ serve: {} });
      } catch (error) {
        // silent fail for ad blockers
      }
    }
  }, [zoneId]);

  return (
    <div className={`exo-im-wrapper ${className}`}>
      {/* 
        afterInteractive ensures it loads fast enough to make you money, 
        but after your critical LCP images load 
      */}
      <Script
        id="exoclick-ad-provider"
        strategy="afterInteractive"
        src="https://a.magsrv.com/ad-provider.js"
      />

      {/* 
        The actual injection point. 
        No absolute positioning or pointer-events are needed here because 
        ExoClick's script will automatically turn this into a fixed bottom-right chat bubble.
      */}
      <ins
        className="eas6a97888e6"
        data-zoneid={zoneId}
        style={{ display: "none" }} // Hide the anchor tag itself so it takes up 0px height in DOM
      />
    </div>
  );
}