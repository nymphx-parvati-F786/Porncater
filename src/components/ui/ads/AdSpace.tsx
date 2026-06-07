"use client";

import { useEffect, useRef } from "react";

interface AdSpaceProps {
  zoneId: string; // The specific ID given to you by ExoClick / JuicyAds
  format: "banner-728x90" | "banner-300x250" | "native" | "popunder";
  className?: string;
}

export default function AdSpace({ zoneId, format, className = "" }: AdSpaceProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent execution if we are in development mode and don't want real ads loading
    if (process.env.NODE_ENV === "development") return;
    if (!adRef.current) return;

    // Clear any existing ad to prevent duplication on re-renders
    adRef.current.innerHTML = "";

    // 1. Create the configuration script object required by adult networks
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    
    // This structure mirrors standard ExoClick/JuicyAds synchronous script injections
    configScript.innerHTML = `
      var ad_idzone = "${zoneId}";
      var ad_width = "${format.includes("728x90") ? "728" : "300"}";
      var ad_height = "${format.includes("728x90") ? "90" : "250"}";
    `;
    
    adRef.current.appendChild(configScript);

    // 2. Load the network's processing engine script
    const engineScript = document.createElement("script");
    engineScript.type = "text/javascript";
    engineScript.src = "https://syndication.exoclick.com/ads.js"; // Replace with your network's script URL
    engineScript.async = true;

    adRef.current.appendChild(engineScript);
  }, [zoneId, format]);

  // Dimensions based on ad layout choice
  const dimensions = format === "banner-728x90" 
    ? "w-[728px] h-[90px]" 
    : "w-[300px] h-[250px]";

  return (
    <div className={`flex flex-col items-center justify-center my-6 ${className}`}>
      {/* Subtle styling to show it's an advertisement container */}
      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2 font-mono block text-center">
        Advertisement
      </span>
      <div 
        ref={adRef} 
        className={`${dimensions} bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden shadow-inner`}
      >
        {process.env.NODE_ENV === "development" && (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900/40">
            Ad Space Zone {zoneId} ({format})
          </div>
        )}
      </div>
    </div>
  );
}