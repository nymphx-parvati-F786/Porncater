"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="flex-1 max-w-md mx-8 hidden lg:block">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          placeholder="Search fantasies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-b border-zinc-800 focus:border-rose-800 outline-none py-2 px-2 pl-8 text-sm placeholder-zinc-600 transition-all text-zinc-200"
        />
        <button type="submit" className="absolute left-0 top-2.5">
          <Search
            className="text-zinc-600 group-focus-within:text-rose-800 transition hover:text-rose-600"
            size={16}
          />
        </button>
      </form>
    </div>
  );
}