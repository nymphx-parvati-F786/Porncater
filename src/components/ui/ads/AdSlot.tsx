'use client';

import { useState, useEffect, useRef } from 'react';

interface AdSlotProps {
  network: 'juicyads' | 'trafficjunky' | 'custom_iframe';
  zoneId: string;
  width: number;
  height: number;
  className?: string;
  iframeSrc?: string;
}

export default function AdSlot({ network, zoneId, width, height, className = '', iframeSrc }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  // Elite Lazy Loading via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Pre-load the ad when it's 200px away from the screen
    );

    if (slotRef.current) {
      observer.observe(slotRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={slotRef}
      className={`flex items-center justify-center bg-zinc-900/30 border border-white/5 rounded-sm overflow-hidden ${className}`}
      // 🔥 SEO SHIELD: Reserve the exact physical space so the layout NEVER shifts
      style={{ minWidth: width, minHeight: height }}
    >
      {isVisible ? (
        <>
          {network === 'custom_iframe' && iframeSrc && (
            <iframe
              src={iframeSrc}
              width={width}
              height={height}
              scrolling="no"
              frameBorder="0"
              loading="lazy"
              title={`Advertisement - Zone ${zoneId}`}
              className="max-w-full h-auto"
            />
          )}
          
          {/* Add specific network logic here if they require <script> tags instead of iframes */}
          {network === 'juicyads' && (
            <iframe
              src={`//adserver.juicyads.com/adshow.php?adzone=${zoneId}`}
              width={width}
              height={height}
              scrolling="no"
              frameBorder="0"
              loading="lazy"
              title="JuicyAds Banner"
            />
          )}
        </>
      ) : (
        // Placeholder skeleton while waiting for scroll
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-zinc-700">Advertisement</span>
        </div>
      )}
    </div>
  );
}