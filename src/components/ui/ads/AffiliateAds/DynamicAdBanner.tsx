"use client";

import { useState, useEffect } from "react";

export interface AdData {
  imageUrl: string;
  trackingLink: string;
}

interface AdBannerProps {
  dimension?: string;
  targetStudio?: string;
  className?: string;
  /** 
   * Set to true ONLY for the main above-the-fold banner.
   * This will make it load with high priority (needed when it is LCP).
   */
  priority?: boolean;
  initialAd?: AdData | null;
}

export default function AdBanner({
  dimension = "300x250",
  targetStudio,
  className = "",
  priority = false,
  initialAd = null,
}: AdBannerProps) {
  const [ad, setAd] = useState<AdData | null>(initialAd);
  const [loading, setLoading] = useState(!initialAd);
  const [imageFailed, setImageFailed] = useState(false);

  const [wStr, hStr] = dimension.split("x");
  const adWidth = parseInt(wStr, 10) || 300;
  const adHeight = parseInt(hStr, 10) || 250;
  const aspectRatio = `${adWidth} / ${adHeight}`;

  useEffect(() => {
    if (initialAd) return;

    const controller = new AbortController();

    const fetchAd = async () => {
      try {
        const url = new URL(`/api/ads`, window.location.origin);
        url.searchParams.set("dimension", dimension);
        if (targetStudio) {
          url.searchParams.set("studio", targetStudio);
        }

        const res = await fetch(url.toString(), { signal: controller.signal });

        if (res.ok) {
          const data = await res.json();
          if (data?.imageUrl) {
            if (data.imageUrl.startsWith("//")) {
              data.imageUrl = "https:" + data.imageUrl;
            }
            setAd(data);
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Ad fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
    return () => controller.abort();
  }, [dimension, targetStudio, initialAd]);

  const renderFallback = () => (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-sm ${
        loading
          ? "animate-pulse bg-zinc-900/50"
          : "border border-rose-900/30 bg-gradient-to-b from-zinc-900 to-black"
      }`}
    >
      {!loading && (
        <>
          <span className="text-rose-500 font-bold uppercase tracking-widest text-sm mb-1">
            Exclusive Offer
          </span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
            Click to unlock
          </span>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`relative block overflow-hidden rounded-sm bg-[#0a0a0a] ${className}`}
      style={{
        width: "100%",
        maxWidth: `${adWidth}px`,
        aspectRatio,
      }}
    >
      <a
        href={ad?.trackingLink || "#"}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="block w-full h-full relative"
      >
        {!ad || loading || imageFailed ? (
          renderFallback()
        ) : (
          <img
            src={ad.imageUrl}
            alt={targetStudio ? `${targetStudio} Offer` : "Promoted Content"}
            width={adWidth}
            height={adHeight}
            // 🔥 Smart loading based on priority
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="w-full h-full object-cover"
            style={{ aspectRatio }}
            onError={() => setImageFailed(true)}
          />
        )}
      </a>
    </div>
  );
}