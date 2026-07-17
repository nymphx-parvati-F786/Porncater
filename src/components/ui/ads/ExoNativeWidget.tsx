"use client";

import { useEffect, useState } from "react";

export default function ExoNativeWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      // 1. Initialize the ExoClick queue
      const win = window as any;
      win.AdProvider = win.AdProvider || [];
      win.AdProvider.push({ "serve": {} });

      // 2. Bruteforce inject the script (Bypasses Next.js strict script limits)
      if (!document.getElementById("exoclick-provider-script")) {
        const script = document.createElement("script");
        script.id = "exoclick-provider-script";
        script.src = "https://a.magsrv.com/ad-provider.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    // 🔥 Added `min-h-[220px]` and a faint background. 
    // This physically prevents the space from vanishing even if ExoClick is loading or blocked.
    <div className="w-full flex items-center justify-center min-h-[220px] bg-zinc-900/10 rounded-sm mt-4 overflow-hidden relative">
      
      {/* 
        🔥 Added `style={{ display: "block", width: "100%" }}` to force the <ins> tag 
        to stretch across the full 6 columns of your grid.
      */}
      <ins 
        className="eas6a97888e20" 
        data-zoneid="5979772" 
        data-keywords="keywords"
        style={{ display: "block", width: "100%" }}
      ></ins>

      {/* 
        This is a fallback message that shows UP if an AdBlocker nukes the script. 
        It sits behind the ad, so if the ad loads, it covers this text up! 
      */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-50 pointer-events-none">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Advertisement (Turn off AdBlocker to view)
        </span>
      </div>

    </div>
  );
}