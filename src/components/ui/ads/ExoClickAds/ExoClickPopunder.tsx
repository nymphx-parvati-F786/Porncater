"use client";

import Script from "next/script";
import { useEffect } from "react";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId: string;
}

// This stops TypeScript from yelling about window.adConfig
declare global {
  interface Window {
    adConfig: any;
  }
}

export default function ExoClickPopunder({ desktopZoneId, mobileZoneId }: ExoClickPopunderProps) {
  useEffect(() => {
    // 1. Detect device to serve the correct Zone ID
    const isMobile = window.innerWidth <= 768;
    const activeZone = isMobile ? mobileZoneId : desktopZoneId;

    // 2. Feed the config to the window object so ExoClick's remote script can read it
    window.adConfig = {
      ads_host: "a.pemsrv.com",
      syndication_host: "s.pemsrv.com",
      idzone: parseInt(activeZone, 10),
      popup_fallback: false,
      popup_force: false,
      chrome_enabled: true,
      new_tab: false,
      frequency_period: 60, // Only show once per hour to avoid annoying users too much
      frequency_count: 1,
      trigger_method: 1, // 🔥 1 = Click anywhere on the page!
      trigger_class: "",
      trigger_delay: 0,
      capping_enabled: true,
      tcf_enabled: true,
      agego_cross_site_enabled: true,
      only_inline: false
    };
  }, [desktopZoneId, mobileZoneId]);

  return (
    <>
      {/* 
        🔥 This fetches the 200 lines of ugly ExoClick code remotely!
        You don't need to paste it in your app. Next.js handles it cleanly.
      */}
      <Script
        id="exoclick-popunder-loader"
        src="//a.pemsrv.com/popunder1000.js"
        strategy="afterInteractive"
      />
    </>
  );
}