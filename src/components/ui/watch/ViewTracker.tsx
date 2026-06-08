"use client";

import { useEffect } from "react";

// This component is invisible. It just sits on the page and fires the view count ping.
export default function ViewTracker({ videoId }: { videoId: number }) {
  useEffect(() => {
    const viewTimer = setTimeout(async () => {
      try {
        await fetch(`/api/videos/${videoId}/view`, { method: "POST" });
        console.log(`🎯 Retention metric logged for video ${videoId}.`);
      } catch (err) {
        console.error("View counter ping failed:", err);
      }
    }, 5000); // 5 seconds retention

    return () => clearTimeout(viewTimer);
  }, [videoId]);

  return null; 
}