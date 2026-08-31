"use client";

import { useEffect, useRef } from "react";

const CAP_KEY = "porncater_popunder_at";
const CAP_MS = 60 * 60 * 1000;

function alreadyFiredThisHour() {
  try {
    const last = parseInt(localStorage.getItem(CAP_KEY) || "0", 10);
    return last > 0 && Date.now() - last < CAP_MS;
  } catch {
    return false;
  }
}

function markFired() {
  try {
    localStorage.setItem(CAP_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
}

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
    if (alreadyFiredThisHour()) return;

    const isMobile = window.innerWidth <= 768;
    const activeZone = isMobile ? mobileZoneId : desktopZoneId;
    if (!activeZone) return;

    injected.current = true;

    const onDisplayed = () => markFired();
    document.addEventListener(`creativeDisplayed-${activeZone}`, onDisplayed);

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
      document.removeEventListener(`creativeDisplayed-${activeZone}`, onDisplayed);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      injected.current = false;
    };
  }, [desktopZoneId, mobileZoneId, triggerMethod]);

  return null;
}
