import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageItems(currentPage: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({
  currentPage,
  totalPages,
  hrefFor,
}: {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 mb-8 flex items-center justify-center gap-1 select-none">
      {currentPage > 1 ? (
        <Link
          href={hrefFor(currentPage - 1)}
          className="h-8 px-3 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-none"
        >
          <ChevronLeft size={14} /> Prev
        </Link>
      ) : (
        <div className="h-8 px-3 flex items-center justify-center bg-black border border-zinc-900 text-zinc-700 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed">
          <ChevronLeft size={14} /> Prev
        </div>
      )}

      <div className="hidden sm:flex gap-1">
        {pageItems(currentPage, totalPages).map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-end justify-center pb-1 text-zinc-600 font-bold tracking-widest text-sm"
              >
                ...
              </span>
            );
          }
          const isCurrent = currentPage === pageNum;
          return (
            <Link
              key={pageNum}
              href={hrefFor(pageNum)}
              className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-none ${
                isCurrent
                  ? "bg-rose-700 text-white border border-rose-700"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={hrefFor(currentPage + 1)}
          className="h-8 px-3 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-none"
        >
          Next <ChevronRight size={14} />
        </Link>
      ) : (
        <div className="h-8 px-3 flex items-center justify-center bg-black border border-zinc-900 text-zinc-700 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed">
          Next <ChevronRight size={14} />
        </div>
      )}
    </div>
  );
}
