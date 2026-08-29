"use client";

import { useEffect } from "react";

export default function ViewTracker({ videoId }: { videoId: number }) {
  useEffect(() => {
    const viewTimer = setTimeout(async () => {
      try {
        await fetch(`/api/videos/${videoId}/view`, {
          method: "POST",
          credentials: "same-origin",
        });
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearTimeout(viewTimer);
  }, [videoId]);

  return null;
}
