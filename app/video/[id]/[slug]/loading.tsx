export default function LoadingWatchPage() {
  return (
    <div className="min-h-screen bg-[#050505] max-w-[1400px] mx-auto px-6 pt-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left: Huge Video Skeleton */}
        <div className="w-full lg:w-[68%]">
          <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-sm ring-1 ring-white/5" />
          <div className="mt-8">
            <div className="h-10 w-3/4 bg-zinc-900 animate-pulse rounded-sm mb-6" />
            <div className="h-4 w-1/4 bg-zinc-900 animate-pulse rounded-sm" />
          </div>
        </div>

        {/* Right: Sidebar Skeleton */}
        <div className="w-full lg:w-[32%] flex flex-col gap-5 mt-10 lg:mt-0">
          <div className="h-8 w-1/3 bg-zinc-900 animate-pulse rounded-sm mb-2" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-[160px] aspect-video bg-zinc-900 animate-pulse rounded-sm" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-3 w-full bg-zinc-900 animate-pulse rounded-sm" />
                <div className="h-3 w-2/3 bg-zinc-900 animate-pulse rounded-sm" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}