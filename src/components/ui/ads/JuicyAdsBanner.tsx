"use client";

import Script from "next/script";

interface JuicyAdProps {
  adZone?: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function JuicyAd({ 
  adZone = "1122022", 
  width = "300", 
  height = "250",
  className = ""
}: JuicyAdProps) {
  
  return (
    <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
      <div 
        className="relative bg-zinc-950 border border-zinc-900/50 rounded-sm overflow-hidden flex items-center justify-center"
        // 🛡️ Lock down the dimensions
        style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
      >
        {/* Placeholder beneath the ad */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <span className="text-[9px] uppercase tracking-widest text-zinc-800 font-mono">JuicyAds</span>
        </div>

        {/* The target container (Z-10 pushes it above the placeholder) */}
        <ins 
          id={adZone} 
          data-width={width} 
          data-height={height}
          className="relative z-10"
        ></ins>
        
        <Script 
          id={`juicy-ads-external-${adZone}`}
          src="https://poweredby.jads.co/js/jads.js" 
          strategy="lazyOnload"
          data-cfasync="false"
        />
        
        <Script 
          id={`juicy-ads-init-${adZone}`}
          strategy="lazyOnload"
        >
          {`(window.adsbyjuicy = window.adsbyjuicy || []).push({'adzone':${adZone}});`}
        </Script>
      </div>
    </div>
  );
}