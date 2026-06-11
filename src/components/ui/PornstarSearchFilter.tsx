"use client";

import { Search, TrendingUp, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function PornstarSearchFilter({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    // Reset page on search execution
    params.delete("page"); 

    startTransition(() => {
      router.push(`/pornstars?${params.toString()}`);
    });
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="relative group w-full sm:w-96">
        <input
          type="text"
          placeholder="Search pornstars..."
          defaultValue={initialQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-zinc-900/30 border-b border-zinc-800 focus:border-rose-800 focus:bg-zinc-900/50 outline-none py-3 px-2 pl-8 text-sm text-zinc-200 transition-all placeholder-zinc-700"
        />
        <Search className={`absolute left-0 top-3 text-zinc-600 group-focus-within:text-rose-800 transition ${isPending ? "animate-pulse text-rose-700" : ""}`} size={18} />
      </div>

      <div className="flex gap-4 w-full sm:w-auto">
        <button className="flex items-center gap-2 border border-zinc-800 hover:border-rose-800 bg-zinc-900/30 px-5 py-2.5 text-[10px] tracking-widest uppercase text-zinc-400 transition-all duration-300 rounded-sm">
          <TrendingUp size={14} /> Trending
        </button>
        <button className="flex items-center gap-2 border border-zinc-800 hover:border-white/30 bg-zinc-900/30 px-5 py-2.5 text-[10px] tracking-widest uppercase text-zinc-400 transition-all duration-300 rounded-sm">
          <Filter size={14} /> Filter A-Z
        </button>
      </div>
    </div>
  );
}