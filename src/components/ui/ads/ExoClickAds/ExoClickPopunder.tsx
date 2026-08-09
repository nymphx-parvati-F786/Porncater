"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId: string;
}

export default function ExoClickPopunder({ desktopZoneId, mobileZoneId }: ExoClickPopunderProps) {
  // We use state to ensure we don't accidentally load the desktop ad on mobile during SSR
  const [activeZone, setActiveZone] = useState<string | null>(null);

  useEffect(() => {
    // 1. Instantly check screen size the moment the component mounts on the client
    setActiveZone(window.innerWidth <= 768 ? mobileZoneId : desktopZoneId);
  }, [desktopZoneId, mobileZoneId]);

  // Don't render the script until we know exactly which Zone ID to use
  if (!activeZone) return null;

  return (
    <Script
      id="exoclick-popunder-loader"
      src="//a.pemsrv.com/popunder1000.js"
      strategy="afterInteractive"
      
      // 🔥 THE SECRET FIX: ExoClick reads these exact data-exo attributes!
      data-exo-idzone={activeZone}
      data-exo-trigger_method="1" // 1 = Click anywhere on the page
      data-exo-frequency_period="60" // 1 Popunder per hour per user
      data-exo-frequency_count="1"
      data-exo-ads_host="a.pemsrv.com"
      data-exo-syndication_host="s.pemsrv.com"
      data-exo-chrome_enabled="true"
      data-exo-new_tab="false"
      data-exo-popup_force="false"
      data-exo-popup_fallback="false"
    />
  );
}