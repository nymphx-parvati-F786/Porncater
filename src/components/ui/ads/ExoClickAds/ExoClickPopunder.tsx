"use client";

import { useEffect, useRef } from "react";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId: string;
}

declare global {
  interface Window {
    adConfig: any;
  }
}

export default function ExoClickPopunder({ desktopZoneId, mobileZoneId }: ExoClickPopunderProps) {
  const scriptInjected = useRef(false);

  useEffect(() => {
    // Prevent double injection in React strict mode
    if (scriptInjected.current) return;
    scriptInjected.current = true;

    // 1. Set the config on the window object
    const isMobile = window.innerWidth <= 768;
    const activeZone = isMobile ? mobileZoneId : desktopZoneId;

    window.adConfig = {
      ads_host: "a.pemsrv.com",
      syndication_host: "s.pemsrv.com",
      idzone: parseInt(activeZone, 10),
      popup_fallback: false,
      popup_force: false,
      chrome_enabled: true,
      new_tab: false,
      frequency_period: 60, // 1 hour cooldown
      frequency_count: 1,
      trigger_method: 1, // 1 = Click anywhere on page
      trigger_class: "",
      trigger_delay: 0,
      capping_enabled: true,
      tcf_enabled: true,
      agego_cross_site_enabled: true,
      only_inline: false
    };

    // 2. Dynamically create the script element
    const script = document.createElement("script");
    script.type = "application/javascript";
    script.src = "//a.pemsrv.com/popunder1000.js";
    script.async = true;

    // 3. Append to the document body to force execution
    document.body.appendChild(script);

    // Cleanup function when the component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      scriptInjected.current = false;
    };
  }, [desktopZoneId, mobileZoneId]);

  return null; // This component renders absolutely nothing to the DOM visually
}