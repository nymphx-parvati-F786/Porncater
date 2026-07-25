"use client";

import { useState, useEffect } from "react";
import ExoClickBanner from "@/src/components/ui/ads/ExoClickAds/ExoClickBanner";
import JuicyAdsBanner from "@/src/components/ui/ads/JuicyAds/JuicyAdsBanner";
import AdultForceBanner from "@/src/components/ui/ads/AdultForceAds/AdultForceBanner";

type AdProvider = "adultforce" | "exoclick" | "juicyads";

interface AdRotatorProps {
  className?: string;
}

export default function AdRotator({ className = "" }: AdRotatorProps) {
  const [provider, setProvider] = useState<AdProvider | null>(null);

  useEffect(() => {
    const providers: AdProvider[] = ["adultforce", "exoclick", "juicyads"];
    setProvider(providers[Math.floor(Math.random() * providers.length)]);
  }, []);

  // 🔥 THE VAULT: This wrapper locks the maximum possible height needed for mobile (262px for Juicy) 
  // and desktop (270px for Juicy). The DOM paints this empty space instantly. No jumping.
  return (
    <div 
      className={`w-full flex justify-center items-center overflow-hidden h-[262px] md:h-[270px] ${className}`}
    >
      {!provider && (
        <div className="animate-pulse bg-zinc-900/20 rounded-sm w-[300px] h-[250px] md:w-[728px] md:h-[90px]" />
      )}

      {provider === "adultforce" && (
        <>
          <AdultForceBanner spotId="10001815" width={900} height={250} className="hidden md:flex border border-zinc-800/80 rounded-sm" />
          <AdultForceBanner spotId="10002483" width={300} height={100} className="flex md:hidden mx-auto border border-zinc-800/80 rounded-sm" />
        </>
      )}

      {provider === "exoclick" && (
        <>
          <ExoClickBanner dimension="300x250" zoneId="5984388" className="flex md:hidden mx-auto" />
          {/* Notice: We changed the 728x90 here to 900x250 so it matches the reserved space better */}
          <ExoClickBanner dimension="900x250" zoneId="5984828" className="hidden md:flex shadow-xl mx-auto" />
        </>
      )}

      {provider === "juicyads" && (
        <>
          <JuicyAdsBanner zoneId="1122799" preset="300x262" className="flex lg:hidden mx-auto" />
          <JuicyAdsBanner zoneId="1122840" preset="908x270" className="hidden lg:flex mx-auto shadow-lg" />
        </>
      )}
    </div>
  );
}