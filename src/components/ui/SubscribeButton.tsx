"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function SubscribeButton() {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <button
      onClick={() => setIsFollowing(!isFollowing)}
      className={`px-8 py-3 rounded-sm text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 flex items-center gap-2 ${
        isFollowing 
          ? "bg-zinc-900 text-zinc-400 border border-zinc-800" 
          : "bg-rose-800 text-white hover:bg-rose-700 shadow-[0_0_15px_rgba(159,18,57,0.3)]"
      }`}
    >
      <Heart size={14} className={isFollowing ? "fill-current" : ""} />
      {isFollowing ? "Subscribed" : "Subscribe"}
    </button>
  );
}