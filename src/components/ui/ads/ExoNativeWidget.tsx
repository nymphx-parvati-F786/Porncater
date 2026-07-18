"use client";

import { useEffect } from "react";

export default function ExoNativeWidget() {
  useEffect(() => {
    // 🔥 By the time this runs, the <ins> tag is 100% guaranteed to be in the DOM.
    if (typeof window !== "undefined") {
      const win = window as any;
      win.AdProvider = win.AdProvider || [];
      
      // Tell ExoClick to look for the tag and fill it!
      win.AdProvider.push({ "serve": {} });

      // Bruteforce inject the script only once
      if (!document.getElementById("exoclick-provider-script")) {
        const script = document.createElement("script");
        script.id = "exoclick-provider-script";
        script.src = "https://a.magsrv.com/ad-provider.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <div className="w-full flex items-center justify-center min-h-[220px] bg-zinc-900/10 rounded-sm mt-4 overflow-hidden relative">
      
      {/* 
        The exact ExoClick container you gave me.
        Rendered immediately so the script finds it on the first scan.
      */}
      <ins 
        className="eas6a97888e20" 
        data-zoneid="5980442"
        style={{ display: "block", width: "100%" }}
      ></ins>

      {/* Fallback Text so you know it's trying to load */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-50 pointer-events-none">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Loading Ads... (Turn off AdBlocker)
        </span>
      </div>

    </div>
  );
}