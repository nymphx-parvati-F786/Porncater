"use client";

import Script from "next/script";

interface JuicyAdProps {
  adZone?: string;
  width?: string;
  height?: string;
}

export default function JuicyAd({ 
  adZone = "1122022", 
  width = "300", 
  height = "250" 
}: JuicyAdProps) {
  return (
    <div className="flex justify-center items-center my-6 bg-zinc-900/30 rounded overflow-hidden">
      {/* The Ad Container */}
      <ins id={adZone} data-width={width} data-height={height}></ins>
      
      {/* External Script */}
      <Script 
        id="juicy-ads-external"
        src="https://poweredby.jads.co/js/jads.js" 
        strategy="lazyOnload" // Loads after the main content so your video doesn't lag
        data-cfasync="false"
      />
      
      {/* Inline Execution Script */}
      <Script 
        id={`juicy-ads-init-${adZone}`}
        strategy="lazyOnload"
      >
        {`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':${adZone}});`}
      </Script>
    </div>
  );
}