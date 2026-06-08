"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ videoId }: { videoId: number }) {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLiking: newLikedState }),
      });
    } catch (error) {
      console.error("Failed to register like action:", error);
      setLiked(!newLikedState); // Revert on failure
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-sm border transition-all duration-300 text-[11px] uppercase tracking-widest ${
        liked 
          ? "border-rose-800/50 bg-rose-900/20 text-rose-500" 
          : "border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-white"
      }`}
    >
      <Heart className={liked ? "fill-rose-500" : ""} size={16} strokeWidth={1.5} />
      {liked ? "Liked" : "Like"}
    </button>
  );
}