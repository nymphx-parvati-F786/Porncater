"use client";

import { useEffect, useRef } from "react";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId: string;
}

export default function ExoClickPopunder({ desktopZoneId, mobileZoneId }: ExoClickPopunderProps) {
  const injected = useRef(false);

  useEffect(() => {
    // Prevent double injection in React strict mode
    if (injected.current) return;
    injected.current = true;

    const isMobile = window.innerWidth <= 768;
    const activeZone = isMobile ? mobileZoneId : desktopZoneId;

    // 🔥 This physically injects the script exactly how ExoClick does it internally
    const script = document.createElement("script");
    script.type = "application/javascript";
    script.async = true;
    script.src = "//a.pemsrv.com/popunder1000.js";
    
    // 🚨 CRITICAL: ExoClick hardcodes this ID. Do not change it!
    script.id = "popmagicldr"; 

    // Inject all the required rules into the script tag
    script.setAttribute("data-exo-idzone", activeZone);
    script.setAttribute("data-exo-trigger_method", "1"); // 1 = Click anywhere on the page
    script.setAttribute("data-exo-frequency_period", "60"); // 1 popunder per hour
    script.setAttribute("data-exo-frequency_count", "1");
    script.setAttribute("data-exo-popup_fallback", "false");
    script.setAttribute("data-exo-popup_force", "false");
    script.setAttribute("data-exo-chrome_enabled", "true");
    script.setAttribute("data-exo-new_tab", "false");

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      injected.current = false;
    };
  }, [desktopZoneId, mobileZoneId]);

  return null;
}