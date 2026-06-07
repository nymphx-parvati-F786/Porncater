"use client";

import { useEffect, useRef } from "react";

interface AdSpaceProps {
  zoneId: string; // Enter your ExoClick Zone ID here: "5944198"
  format: "banner-300x250" | "banner-728x90";
  className?: string;
}

export default function AdSpace({ zoneId, format, className = "" }: AdSpaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Guard clause for local testing environment
    if (process.env.NODE_ENV === "development") return;
    if (!containerRef.current) return;

    // 2. Wipe clean to prevent duplicating ads during Next.js hydration or hot reloads
    containerRef.current.innerHTML = "";

    // 3. Inject the core processing engine script (<script async src="..."></script>)
    // Checking if the script is already present globally so we don't load it multiple times
    if (!document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
      const coreScript = document.createElement("script");
      coreScript.async = true;
      coreScript.type = "application/javascript";
      coreScript.src = "https://a.magsrv.com/ad-provider.js";
      document.head.appendChild(coreScript);
    }

    // 4. Build the unique targeting element (<ins class="eas6a97888e2" data-zoneid="..."></ins>)
    const insTag = document.createElement("ins");
    insTag.className = "eas6a97888e2";
    insTag.setAttribute("data-zoneid", zoneId);
    containerRef.current.appendChild(insTag);

    // 5. Initialize the specific ad space trigger array 
    const triggerScript = document.createElement("script");
    triggerScript.innerHTML = `
      (window.AdProvider = window.AdProvider || []).push({"serve": {}});
    `;
    containerRef.current.appendChild(triggerScript);

  }, [zoneId]);

  // Handle dimensions based on your dashboard setup
  const dimensions = format === "banner-728x90" 
    ? "w-[728px] h-[90px]" 
    : "w-[300px] h-[250px]";

  return (
    <div className={`flex flex-col items-center justify-center my-6 ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2 font-mono">
        Advertisement
      </span>
      
      <div 
        ref={containerRef} 
        className={`${dimensions} bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex items-center justify-center`}
      >
        {/* Placeholder displays ONLY when working locally on localhost */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-center">
            ExoClick Zone: {zoneId} <br />
            <span className="text-[9px] text-zinc-600">({format})</span>
          </div>
        )}
      </div>
    </div>
  );
}