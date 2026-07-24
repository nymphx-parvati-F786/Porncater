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
    // Select provider only after client mount to prevent SSR hydration errors
    const providers: AdProvider[] = ["adultforce", "exoclick", "juicyads"];
    const randomIndex = Math.floor(Math.random() * providers.length);
    setProvider(providers[randomIndex]);
  }, []);

  // Skeleton placeholder until provider is selected
  if (!provider) {
    return (
      <div 
        className={`animate-pulse bg-zinc-900/30 rounded-sm w-full min-h-[100px] md:min-h-[250px] ${className}`} 
      />
    );
  }

  return (
    <div className={`w-full flex justify-center items-center overflow-hidden ${className}`}>
      {/* 1. AdultForce Option */}
      {provider === "adultforce" && (
        <>
          <AdultForceBanner
            spotId="10001815"
            width={900}
            height={250}
            className="hidden md:flex border border-zinc-800/80 rounded-sm"
          />
          <AdultForceBanner
            spotId="10002483"
            width={300}
            height={100}
            className="flex md:hidden mx-auto border border-zinc-800/80 rounded-sm"
          />
        </>
      )}

      {/* 2. ExoClick Option */}
      {provider === "exoclick" && (
        <>
          <ExoClickBanner
            dimension="300x250"
            zoneId="5984388"
            className="flex md:hidden mx-auto"
          />
          <ExoClickBanner
            dimension="728x90"
            zoneId="222222"
            className="hidden md:flex lg:hidden"
          />
          <ExoClickBanner
            dimension="900x250"
            zoneId="5984828"
            className="hidden lg:flex shadow-xl"
          />
        </>
      )}

      {/* 3. JuicyAds Option */}
      {provider === "juicyads" && (
        <>
          <JuicyAdsBanner
            zoneId="1122799"
            preset="300x262"
            className="flex lg:hidden mx-auto"
          />
          <JuicyAdsBanner
            zoneId="1122840"
            preset="908x270"
            className="hidden lg:flex mx-auto shadow-lg"
          />
        </>
      )}
    </div>
  );
}