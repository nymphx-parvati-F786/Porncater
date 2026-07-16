import Link from "next/link";
import { AlertCircle, Flame, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-rose-900 selection:text-white">
      
      <div className="text-rose-800 mb-4">
        <AlertCircle size={48} strokeWidth={1} />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-widest mb-2">
        404
      </h1>
      
      <h2 className="text-base md:text-lg font-light text-zinc-300 mb-2">
        Scene Not Found
      </h2>
      
      <p className="text-zinc-500 text-xs text-center max-w-sm leading-relaxed mb-8">
        The video or page you are looking for has been removed, deleted under DMCA, or never existed.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link 
          href="/trending" 
          className="flex items-center justify-center gap-1.5 flex-1 bg-rose-800/90 hover:bg-rose-700 text-white px-4 py-2.5 rounded-sm text-xs tracking-wide font-medium transition-colors"
        >
          <Flame size={14} /> Trending
        </Link>
        
        <Link 
          href="/" 
          className="flex items-center justify-center gap-1.5 flex-1 bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 px-4 py-2.5 rounded-sm text-xs tracking-wide font-medium transition-colors"
        >
          <Search size={14} /> Home
        </Link>
      </div>

    </div>
  );
}