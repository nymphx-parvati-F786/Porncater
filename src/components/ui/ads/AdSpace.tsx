"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface AdSpaceProps {
  zoneId: string;
  format: "banner-300x250" | "banner-728x90" | "banner-900x250";
  className?: string;
}

export default function AdSpace({ zoneId, format, className = "" }: AdSpaceProps) {
  // const isDev = process.env.NODE_ENV === "development";
  const isDev = false;
  const hasFired = useRef(false);

  // Reserve exact pixel dimensions for Google Core Web Vitals
  let width = 300;
  let height = 250;
  if (format === "banner-728x90") { width = 728; height = 90; }
  if (format === "banner-900x250") { width = 900; height = 250; }

  useEffect(() => {
    if (isDev || hasFired.current) return;
    
    // Safely trigger the ExoClick render sequence once the component mounts
    hasFired.current = true;
    const adProvider = (window as any).AdProvider = (window as any).AdProvider || [];
    adProvider.push({"serve": {}});
  }, [isDev]);

  return (
    <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
      <span className="text-[8px] uppercase tracking-widest text-zinc-700 mb-1.5 font-mono">
        Advertisement
      </span>
      
      {/* 🛡️ CLS BUSTER: Min-width and min-height prevent layout shift */}
      <div 
        className="bg-zinc-950 border border-zinc-900/50 rounded-sm overflow-hidden flex items-center justify-center relative"
        style={{ minWidth: width, minHeight: height, maxWidth: '100%' }}
      >
        {!isDev ? (
          <>
            {/* The global script is loaded lazily and safely via Next.js */}
            <Script src="https://a.magsrv.com/ad-provider.js" strategy="lazyOnload" />
            
            {/* The actual ad container targeted by ExoClick */}
            <ins 
              className="eas6a97888e2" 
              data-zoneid={zoneId}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </>
        ) : (
          <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider text-center">
            [ ExoClick Zone: {zoneId} ]
          </div>
        )}
      </div>
    </div>
  );
}