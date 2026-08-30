"use client";

import { useEffect, useRef } from "react";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId?: string;
  /** Exo: 1 = click anywhere, 3 = click on links. Default 1 matches the working watch-page zone. */
  triggerMethod?: "1" | "3";
}

export default function ExoClickPopunder({
  desktopZoneId,
  mobileZoneId,
  triggerMethod = "1",
}: ExoClickPopunderProps) {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    if (typeof window === "undefined") return;
    if (document.getElementById("popmagicldr")) return;

    const isMobile = window.innerWidth <= 768;
    const activeZone = isMobile ? mobileZoneId : desktopZoneId;
    if (!activeZone) return;

    injected.current = true;

    const script = document.createElement("script");
    script.type = "application/javascript";
    script.async = true;
    script.src = "//a.pemsrv.com/popunder1000.js";
    script.id = "popmagicldr";

    script.setAttribute("data-exo-idzone", activeZone);
    script.setAttribute("data-exo-trigger_method", triggerMethod);
    script.setAttribute("data-exo-frequency_period", "60");
    script.setAttribute("data-exo-frequency_count", "1");
    script.setAttribute("data-exo-popup_fallback", "false");
    script.setAttribute("data-exo-popup_force", "false");
    script.setAttribute("data-exo-chrome_enabled", "true");
    script.setAttribute("data-exo-new_tab", "false");
    script.setAttribute("data-exo-capping_enabled", "true");

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      injected.current = false;
    };
  }, [desktopZoneId, mobileZoneId, triggerMethod]);

  return null;
}
