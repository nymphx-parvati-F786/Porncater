"use client";

import { useEffect, useState } from "react";

interface ExoNativeAd {
  title: string;
  image: string;
  click_url: string;
  branding?: string;
}

export default function ExoNativeApiGrid({ zoneId }: { zoneId: string }) {
  const [ads, setAds] = useState<ExoNativeAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNativeAds() {
      try {
        const res = await fetch("https://s.magsrv.com/v1/api.php", {
          method: "POST",
          // 🔥 Bypasses CORS Pre-flight checks on the browser
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            user: {
              ua: navigator.userAgent, // ExoClick needs this to target mobile vs desktop
            },
            zones: [{ id: zoneId }]
          })
        });

        const data = await res.json();
        
        // Traverse the ExoClick JSON response and extract the array of ads
        if (data && data.zones && data.zones[zoneId]) {
          setAds(data.zones[zoneId]);
        }
      } catch (err) {
        console.error("Ad fetch failed. Blocker might be active.");
      } finally {
        setLoading(false);
      }
    }

    fetchNativeAds();
  }, [zoneId]);

  // 🔥 SKELETON LOADER: Prevents layout shift while ads load
  if (loading) {
    return (
      <div className="col-span-full w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group flex flex-col animate-pulse">
            <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md rounded-sm"></div>
            <div className="mt-3 h-3 bg-zinc-800 w-3/4 rounded-sm"></div>
            <div className="mt-2 h-2 bg-zinc-800/50 w-1/2 rounded-sm"></div>
          </div>
        ))}
      </div>
    );
  }

  // If blocked or failed, return nothing so the grid just ends cleanly
  if (!ads.length) return null;

  return (
    // We recreate the exact grid structure of your homepage here so it aligns perfectly!
    <div className="col-span-full w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mt-2">
      {ads.slice(0, 6).map((ad, i) => (
        <a 
          key={i} 
          href={ad.click_url} 
          target="_blank" 
          rel="noopener noreferrer nofollow sponsored" 
          className="group flex flex-col cursor-pointer"
        >
          <div className="relative overflow-hidden bg-zinc-900 aspect-video shadow-md border border-transparent group-hover:border-rose-900/50 transition-colors">
            
            <img 
              src={ad.image} 
              alt={ad.title} 
              loading="lazy" 
              className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all duration-200" 
            />
            
            {/* The Camouflage Badges */}
            <div className="absolute top-1.5 left-1.5 bg-zinc-800/90 backdrop-blur-sm text-zinc-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-widest border border-zinc-700">
              AD
            </div>
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
              SPONSORED
            </div>
          </div>
          
          <div className="mt-2 flex flex-col flex-grow">
            <h3 className="font-light text-zinc-300 text-sm line-clamp-2 leading-relaxed group-hover:text-amber-500 transition-colors duration-75">
              {ad.title}
            </h3>
            <div className="flex items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest mt-auto pt-1.5 font-medium">
              <span>{ad.branding || "Promoted Content"}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}