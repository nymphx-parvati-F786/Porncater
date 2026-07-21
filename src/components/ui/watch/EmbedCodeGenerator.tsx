'use client';

import { useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';

// 🔥 THIS INTERFACE FIXES YOUR TYPESCRIPT ERROR
interface EmbedProps {
  videoId: number;
  videoTitle: string;
}

export default function EmbedCodeGenerator({ videoId, videoTitle }: EmbedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // The perfectly formatted SEO-friendly iframe code
  const embedCode = `<iframe src="https://porncater.com/embed/${videoId}" width="640" height="360" frameborder="0" title="${videoTitle.replace(/"/g, '&quot;')}" scrolling="no" allowfullscreen></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <>
      {/* Trigger Button - Matches the sleek Watch Page UI */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-white/30 hover:text-white transition-all duration-300 text-[11px] uppercase tracking-widest"
      >
        <Code size={16} strokeWidth={1.5} /> Embed
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-zinc-800 w-full max-w-lg rounded-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="text-lg font-serif italic text-white tracking-wide">Embed This Video</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-rose-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-zinc-400 font-medium">
                Copy and paste this HTML code into your website or blog to embed this video.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  value={embedCode}
                  className="w-full h-24 bg-black border border-zinc-800 rounded-sm p-3 text-xs text-zinc-300 font-mono resize-none focus:outline-none focus:border-rose-900/50 selection:bg-rose-900/50 scrollbar-hide"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${
                  copied 
                    ? "bg-emerald-900/40 text-emerald-500 border border-emerald-900/50" 
                    : "bg-rose-700 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(190,18,60,0.2)]"
                }`}
              >
                {copied ? (
                  <><Check size={16} strokeWidth={2.5} /> Copied to Clipboard!</>
                ) : (
                  <><Copy size={16} strokeWidth={2} /> Copy Embed Code</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}