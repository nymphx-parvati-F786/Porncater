"use client";

import { useState, useEffect } from "react";

interface AdBannerProps {
  dimension?: string;
  targetStudio?: string;
  className?: string;
}

export default function AdBanner({
  dimension = "300x250",
  targetStudio,
  className = "",
}: AdBannerProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        // Safely construct the URL
        const url = new URL(`/api/ads`, window.location.origin);
        url.searchParams.set("dimension", dimension);
        if (targetStudio) {
          url.searchParams.set("studio", targetStudio);
        }

        const res = await fetch(url.toString());
        
        if (res.ok) {
          const data = await res.json();
          
          if (data && data.imageUrl) {
            // 🔥 FIX 1: The Localhost Bug. Force HTTPS if URL is relative.
            if (data.imageUrl.startsWith("//")) {
              data.imageUrl = "https:" + data.imageUrl;
            }
            setAd(data);
          }
        }
      } catch (error) {
        console.error("Ad fetch error (Likely blocked by browser extension):", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [dimension, targetStudio]);

  // Loading Skeleton
  if (loading) {
    return (
      <div 
        className={`animate-pulse bg-zinc-900/40 rounded-sm w-full ${className}`} 
        style={{ minHeight: dimension.includes("90") || dimension.includes("70") ? "90px" : "250px" }} 
      />
    );
  }

  // If API returns no ad, collapse silently without breaking layout
  if (!ad) return null; 

  return (
    <div className={`overflow-hidden rounded-sm group relative block bg-[#0a0a0a] ${className}`}>
      <a 
        href={ad.trackingLink} 
        target="_blank" 
        rel="noopener noreferrer nofollow sponsored"
        className="block w-full h-full relative active:scale-[0.98] transition-transform"
      >
        {!imageFailed ? (
          <img 
            src={ad.imageUrl} 
            alt={targetStudio || "Promoted Content"} 
            className="w-full h-auto object-cover rounded-sm"
            loading="lazy"
            // 🔥 FIX 2: Ad-Blocker Proofing. If the image request is blocked, flip the state.
            onError={() => setImageFailed(true)} 
          />
        ) : (
          // 🔥 FIX 3: The CSS Fallback. 
          // If the image breaks, they see this sexy, un-blockable text CTA instead of an invisible box.
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center border border-rose-900/40 bg-gradient-to-b from-zinc-900 to-black rounded-sm"
            style={{ minHeight: dimension.includes("90") || dimension.includes("70") ? "90px" : "250px" }}
          >
            <span className="text-rose-500 font-bold uppercase tracking-widest text-sm md:text-base mb-1">
              Exclusive VIP Access
            </span>
            <span className="text-zinc-400 text-[10px] md:text-xs uppercase font-medium tracking-wider">
              Click Here to Claim Your Offer
            </span>
          </div>
        )}
        
        {/* Subtle 'Sponsored' badge so it blends in like premium content */}
        {/* <span className="absolute top-1.5 right-1.5 bg-black/80 text-zinc-500 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] border border-zinc-800">
          Sponsored
        </span> */}
      </a>
    </div>
  );
}