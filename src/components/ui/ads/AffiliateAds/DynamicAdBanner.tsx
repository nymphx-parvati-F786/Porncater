"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface AdBannerProps {
  dimension?: string; // Format must be "WxH", e.g., "300x250", "970x70"
  targetStudio?: string;
  className?: string;
  priority?: boolean; // 🔥 NEW: Tells Next.js this is an LCP element!
}

export default function AdBanner({
  dimension = "300x250",
  targetStudio,
  className = "",
  priority = false,
}: AdBannerProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  // 🔥 MATHEMATICALLY PERFECT LAYOUT RESERVATION
  // Parse the exact width and height from the dimension string to prevent CLS.
  const [wStr, hStr] = dimension.split("x");
  const adWidth = parseInt(wStr) || 300;
  const adHeight = parseInt(hStr) || 250;
  const aspectRatio = `${adWidth} / ${adHeight}`;

  useEffect(() => {
    // We use AbortController to prevent memory leaks if the user navigates away quickly
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
            // Force HTTPS for protocol-relative URLs
            if (data.imageUrl.startsWith("//")) {
              data.imageUrl = "https:" + data.imageUrl;
            }
            setAd(data);
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Ad fetch error (Likely blocked by extension):", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
    return () => controller.abort();
  }, [dimension, targetStudio]);

  // 🔥 THE FALLBACK CTA: Shown if loading, if API fails, OR if ad-blocker kills the image.
  // We NEVER return `null` because collapsing the container causes a Cumulative Layout Shift.
  const renderFallback = () => (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-sm ${loading ? 'animate-pulse bg-zinc-900/40' : 'border border-rose-900/40 bg-gradient-to-b from-zinc-900 to-black cursor-pointer'}`}
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
      // 🔥 THE CLS KILLER: This locks the box to the exact dimensions of the expected ad instantly.
      style={{ 
        width: "100%", 
        maxWidth: `${adWidth}px`, 
        aspectRatio: aspectRatio 
      }}
    >
      <a 
        href={ad?.trackingLink || "#"} 
        target="_blank" 
        rel="noopener noreferrer nofollow sponsored"
        className="block w-full h-full relative group active:scale-[0.98] transition-transform"
      >
        {(!ad || loading || imageFailed) ? renderFallback() : (
          <Image 
            src={ad.imageUrl} 
            alt={targetStudio || "Promoted Content"} 
            fill
            sizes={`(max-width: 768px) 100vw, ${adWidth}px`}
            priority={priority} // 🔥 Toggles fetchPriority="high" and removes loading="lazy" automatically
            className="object-cover rounded-sm"
            onError={() => setImageFailed(true)} 
          />
        )}

        {/* Optional: Subtle native tagging */}
        {/* <span className="absolute top-1.5 right-1.5 bg-black/80 text-zinc-500 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] border border-zinc-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Sponsored
        </span> */}
      </a>
    </div>
  );
}