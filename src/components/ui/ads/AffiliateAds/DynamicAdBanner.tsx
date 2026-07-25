"use client";

import { useState, useEffect } from "react";

export interface AdData {
  imageUrl: string;
  trackingLink: string;
}

interface AdBannerProps {
  dimension?: string; // Format: "WxH", e.g., "300x250", "970x70"
  targetStudio?: string;
  className?: string;
  priority?: boolean; // Set to true for above-the-fold LCP elements
  initialAd?: AdData | null; // 🔥 Server-injected ad data for instant LCP
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

  // Parse exact dimensions to reserve container layout instantly and eliminate CLS
  const [wStr, hStr] = dimension.split("x");
  const adWidth = parseInt(wStr, 10) || 300;
  const adHeight = parseInt(hStr, 10) || 250;
  const aspectRatio = `${adWidth} / ${adHeight}`;

  useEffect(() => {
    // If ad data was pre-fetched on the server, skip client-side fetching
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
          if (data && data.imageUrl) {
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
          ? "animate-pulse bg-zinc-900/40"
          : "border border-rose-900/40 bg-gradient-to-b from-zinc-900 to-black cursor-pointer"
      }`}
    >
      {!loading && (
        <>
          <span className="text-rose-500 font-bold uppercase tracking-widest text-sm md:text-base mb-1">
            Exclusive VIP Access
          </span>
          <span className="text-zinc-400 text-[10px] md:text-xs uppercase font-medium tracking-wider">
            Click Here to Claim Your Offer
          </span>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`relative block rounded-sm bg-[#0a0a0a] overflow-hidden ${className}`}
      style={{
        width: "100%",
        maxWidth: `${adWidth}px`,
        aspectRatio: aspectRatio,
      }}
    >
      <a
        href={ad?.trackingLink || "#"}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="block w-full h-full relative group active:scale-[0.98] transition-transform"
      >
        {!ad || loading || imageFailed ? (
          renderFallback()
        ) : (
          <img
            src={ad.imageUrl}
            alt={targetStudio || "Promoted Content"}
            width={adWidth}
            height={adHeight}
            // 🔥 NATIVE LCP OPTIMIZATION: Bypasses client JS and Vercel image proxy
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-auto object-cover rounded-sm"
            style={{ aspectRatio: aspectRatio }}
            onError={() => setImageFailed(true)}
          />
        )}
      </a>
    </div>
  );
}