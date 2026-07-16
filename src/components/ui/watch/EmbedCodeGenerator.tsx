"use client";

import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";

export default function EmbedCodeGenerator({ videoId }: { videoId: number }) {
  const [copied, setCopied] = useState(false);
  const iframeCode = `<iframe src="https://porncater.com/embed/${videoId}" width="640" height="360" frameborder="0" scrolling="no" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-sm">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <Code size={16} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Embed This Video</span>
      </div>
      <div className="flex items-center gap-2">
        <input 
          readOnly 
          value={iframeCode}
          className="flex-1 bg-black border border-white/5 text-zinc-500 font-mono text-xs p-2.5 outline-none selection:bg-rose-900 selection:text-white"
        />
        <button 
          onClick={handleCopy}
          className="bg-rose-800 hover:bg-rose-700 text-white p-2.5 rounded-sm transition-colors flex items-center justify-center min-w-[40px]"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}