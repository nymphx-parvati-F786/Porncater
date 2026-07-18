// import { prisma } from "@/lib/prisma";
// import { Metadata } from "next";
// import { Play, User, Flame, Clock, Sparkles } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import SearchBar from "@/src/components/ui/SearchBar";
// export const revalidate = 60;
// // =========================================================
// // 🚀 FRONT-DOOR SEO ENGINE (HOMEPAGE METADATA)
// // =========================================================
// export const metadata: Metadata = {
//     title: "PornCater | Free HD Porn Videos & Premium Adult Cinema",
//     description: "Watch the best free HD porn videos, featuring top pornstars and exclusive premium adult cinema. Updated daily with fresh, high-quality sex tube scenes.",
//     keywords: "free porn, HD porn videos, sex tube, adult cinema, pornstars, XXX movies",
//     alternates: {
//         canonical: "https://porncater.com/",
//     },
//     openGraph: {
//         title: "PornCater | Free HD Porn Videos",
//         description: "Stream exclusive HD adult cinema and trending porn videos.",
//         url: "https://porncater.com/",
//         siteName: "PornCater",
//         type: "website",
//     },
// };
// export default async function Home() {
//     const [trendingVideos, latestVideos, topPornstars] = await Promise.all([
//         prisma.video.findMany({
//             take: 20,
//             orderBy: { views: "desc" },
//             select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
//         }),
//         prisma.video.findMany({
//             take: 20,
//             orderBy: { createdAt: "desc" },
//             select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
//         }),
//         prisma.pornstar.findMany({
//             take: 5,
//             orderBy: { views: "desc" },
//             select: { id: true, slug: true, name: true, avatarUrl: true, views: true },
//         }),
//     ]);
//     const categories = [
//         "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie",
//         "MILF", "Teen", "Anal", "Threesome", "Interracial",
//     ];
//     // 🔥 SEO UPGRADE: Sitelinks Search Box Schema
//     const jsonLd = {
//         "@context": "https://schema.org",
//         "@type": "WebSite",
//         "name": "PornCater",
//         "alternateName": "Porn Cater",
//         "url": "https://porncater.com/",
//         "potentialAction": {
//             "@type": "SearchAction",
//             "target": "https://porncater.com/search?q={search_term_string}",
//             "query-input": "required name=search_term_string"
//         }
//     };
//     return (
//         <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
//             {/* Injecting the Machine-Readable Schema */}
//             <script
//                 type="application/ld+json"
//                 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//             />
//             {/* 🔥 SEO FIX: The Visually Hidden H1 Tag. */}
//             <h1 className="sr-only">Free HD Porn Videos & Premium Adult Cinema - PornCater</h1>
//             {/* Navbar */}
//             <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
//                 <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center gap-12">
//                         <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
//                             <span className="font-serif italic text-rose-800 pr-1">Porn</span>
//                             <span className="font-light text-white">Cater</span>
//                         </Link>
//                         {/* Links - Kept default prefetch so navigation is instant */}
//                         <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
//                             <Link href="/" className="hover:text-white transition duration-300">Home</Link>
//                             <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
//                             <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
//                         </div>
//                     </div>
//                     <SearchBar />
//                     {/* Auth */}
//                     <div className="flex items-center gap-6 text-sm tracking-wide">
//                         <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
//                             Upload
//                         </Link>
//                     </div>
//                 </div>
//             </nav>
//             {/* Categories */}
//             <div className="max-w-[1400px] mx-auto px-6 py-12">
//                 <div className="flex flex-wrap gap-3">
//                     {categories.map((cat, i) => (
//                         <Link
//                             key={i}
//                             href={`/category/${cat.toLowerCase()}`}
//                             prefetch={false} // 🔥 ADDED: Stops background 404s
//                             className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-5 py-2 text-xs tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm"
//                         >
//                             {cat}
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* Trending Section (Above The Fold) */}
//             <div className="max-w-[1400px] mx-auto px-6 py-10">
//                 <div className="flex items-center gap-3 mb-8">
//                     <Flame className="text-rose-800" size={24} strokeWidth={1.5} />
//                     <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                         Trending Porn Videos
//                     </h2>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
//                     {trendingVideos.map((video, index) => (
//                         <Link
//                             key={video.id}
//                             href={`/watch/${video.id}/${video.slug}`}
//                             prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                             className="group block cursor-pointer"
//                         >
//                             <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
//                                 <Image
//                                     src={video.thumbnail}
//                                     alt={video.title}
//                                     fill
//                                     sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
//                                     priority={index < 4}
//                                     className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
//                                 />
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                                 <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
//                                     HD
//                                 </div>
//                             </div>
//                             <div className="mt-3 px-1">
//                                 <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
//                                     {video.title}
//                                 </h3>
//                                 <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
//                                     {Number(video.views || 0).toLocaleString()} views
//                                 </p>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* Latest Uploads (Below The Fold) */}
//             <div className="bg-[#030303] border-y border-white/5">
//                 <div className="max-w-[1400px] mx-auto px-6 py-16">
//                     <div className="flex items-center justify-between mb-8">
//                         <div className="flex items-center gap-3">
//                             <Clock className="text-zinc-500" size={24} strokeWidth={1.5} />
//                             <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                                 Latest Porn Videos
//                             </h2>
//                         </div>
//                         <Link href="/latest" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
//                             View Directory
//                         </Link>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
//                         {latestVideos.map((video) => (
//                             <Link
//                                 key={video.id}
//                                 href={`/watch/${video.id}/${video.slug}`}
//                                 prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                                 className="group block cursor-pointer"
//                             >
//                                 <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
//                                     <Image
//                                         src={video.thumbnail}
//                                         alt={video.title}
//                                         fill
//                                         sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
//                                         className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
//                                     />
//                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                                     <div className="absolute top-2 left-2 border border-rose-800/50 bg-rose-900/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-rose-100">
//                                         NEW
//                                     </div>
//                                 </div>
//                                 <div className="mt-3 px-1">
//                                     <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
//                                         {video.title}
//                                     </h3>
//                                     <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
//                                         {Number(video.views || 0).toLocaleString()} views
//                                     </p>
//                                 </div>
//                             </Link>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//             {/* Top Pornstars Section */}
//             <div className="max-w-[1400px] mx-auto px-6 py-20">
//                 <div className="flex items-center justify-between mb-10">
//                     <div className="flex items-center gap-3">
//                         <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
//                         <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                             Top Pornstars
//                         </h2>
//                     </div>
//                     <Link href="/pornstars" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
//                         View All Pornstars
//                     </Link>
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
//                     {topPornstars.map((star) => (
//                         <Link
//                             key={star.id}
//                             href={`/pornstars/${star.slug}`}
//                             prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                             className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]"
//                         >
//                             <Image
//                                 src={star.avatarUrl || "/thumbnails/default-avatar.png"}
//                                 alt={star.name}
//                                 fill
//                                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
//                                 className="object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
//                             <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
//                                 <h3 className="text-white font-serif italic text-xl tracking-wide mb-1">
//                                     {star.name}
//                                 </h3>
//                                 <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
//                                     <span>{Number(star.views || 0).toLocaleString()} views</span>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* === ADVERTISEMENT === */}
//             <div className="max-w-[1400px] mx-auto px-6 py-8 flex justify-center">
//                 <div className="border border-zinc-800/50 bg-black/30 rounded-sm p-3">
//                     <iframe
//                         style={{ backgroundColor: "white" }}
//                         width="315"
//                         height="300"
//                         scrolling="no"
//                         frameBorder="0"
//                         {...({ allowtransparency: "true" } as any)}
//                         marginHeight={0}
//                         marginWidth={0}
//                         name="spot_id_10002484"
//                         src="//a.adtng.com/get/10002484?ata=deviparvatilovemuslimcocks"
//                         title="Advertisement"
//                         loading="lazy"
//                     />
//                 </div>
//             </div>
//             {/* Upgraded Footer with Legal Links */}
//             <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
//                 <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
//                     <Link href="/dmca" className="hover:text-white transition duration-300">DMCA / Copyright</Link>
//                     <Link href="/privacy-policy" className="hover:text-white transition duration-300">Privacy Policy</Link>
//                     <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition duration-300">Terms of Service</Link>
//                     <Link href="/2257" className="hover:text-white transition duration-300">18 U.S.C. 2257</Link>
//                     <Link href="/contact" className="hover:text-white transition duration-300">Contact Us</Link>
//                 </div>
//                 <div className="text-xl tracking-widest mb-4">
//                     <span className="font-serif italic text-rose-800 pr-1">Porn</span>
//                     <span className="font-light text-zinc-600">Cater</span>
//                 </div>
//                 <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-2xl mx-auto px-6 leading-relaxed mb-4">
//                     All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
//                 </p>
//                 <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
//                     © {new Date().getFullYear()} • Exclusive Adult Cinema • 18+ Only
//                 </p>
//             </footer>
//         </div>
//     );
// } so baby first do you see that catgeory button right below navbar, for a niche free porn tube site, and better space utilization cuz its not a premium site that leaves proper space for porn watcher, i want maximum porn addicts and porn viewer retention while maintaining maximum utilization of space so ad revenue is also best, so baby improve that category button or if you want stich it just after nav bar and if you want fully revamp it for best free porn tube site which engage porn viewers and hella best porn watching experience, after this just below the navbar with stiched category bar, i am thinking to place a long banner width wise not length that much long, ok and then my video grids below it, first lets revamp the first thing import { prisma } from "@/lib/prisma";
// import { Metadata } from "next";
// import { Play, User, Flame, Clock, Sparkles } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import SearchBar from "@/src/components/ui/SearchBar";
// export const revalidate = 60;
// // =========================================================
// // 🚀 FRONT-DOOR SEO ENGINE (HOMEPAGE METADATA)
// // =========================================================
// export const metadata: Metadata = {
//     title: "PornCater | Free HD Porn Videos & Premium Adult Cinema",
//     description: "Watch the best free HD porn videos, featuring top pornstars and exclusive premium adult cinema. Updated daily with fresh, high-quality sex tube scenes.",
//     keywords: "free porn, HD porn videos, sex tube, adult cinema, pornstars, XXX movies",
//     alternates: {
//         canonical: "https://porncater.com/",
//     },
//     openGraph: {
//         title: "PornCater | Free HD Porn Videos",
//         description: "Stream exclusive HD adult cinema and trending porn videos.",
//         url: "https://porncater.com/",
//         siteName: "PornCater",
//         type: "website",
//     },
// };
// export default async function Home() {
//     const [trendingVideos, latestVideos, topPornstars] = await Promise.all([
//         prisma.video.findMany({
//             take: 20,
//             orderBy: { views: "desc" },
//             select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
//         }),
//         prisma.video.findMany({
//             take: 20,
//             orderBy: { createdAt: "desc" },
//             select: { id: true, slug: true, title: true, thumbnail: true, duration: true, views: true },
//         }),
//         prisma.pornstar.findMany({
//             take: 5,
//             orderBy: { views: "desc" },
//             select: { id: true, slug: true, name: true, avatarUrl: true, views: true },
//         }),
//     ]);
//     const categories = [
//         "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie",
//         "MILF", "Teen", "Anal", "Threesome", "Interracial",
//     ];
//     // 🔥 SEO UPGRADE: Sitelinks Search Box Schema
//     const jsonLd = {
//         "@context": "https://schema.org",
//         "@type": "WebSite",
//         "name": "PornCater",
//         "alternateName": "Porn Cater",
//         "url": "https://porncater.com/",
//         "potentialAction": {
//             "@type": "SearchAction",
//             "target": "https://porncater.com/search?q={search_term_string}",
//             "query-input": "required name=search_term_string"
//         }
//     };
//     return (
//         <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
//             {/* Injecting the Machine-Readable Schema */}
//             <script
//                 type="application/ld+json"
//                 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//             />
//             {/* 🔥 SEO FIX: The Visually Hidden H1 Tag. */}
//             <h1 className="sr-only">Free HD Porn Videos & Premium Adult Cinema - PornCater</h1>
//             {/* Navbar */}
//             <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
//                 <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center gap-12">
//                         <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
//                             <span className="font-serif italic text-rose-800 pr-1">Porn</span>
//                             <span className="font-light text-white">Cater</span>
//                         </Link>
//                         {/* Links - Kept default prefetch so navigation is instant */}
//                         <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
//                             <Link href="/" className="hover:text-white transition duration-300">Home</Link>
//                             <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
//                             <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
//                         </div>
//                     </div>
//                     <SearchBar />
//                     {/* Auth */}
//                     <div className="flex items-center gap-6 text-sm tracking-wide">
//                         <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
//                             Upload
//                         </Link>
//                     </div>
//                 </div>
//             </nav>
//             {/* Categories */}
//             <div className="max-w-[1400px] mx-auto px-6 py-12">
//                 <div className="flex flex-wrap gap-3">
//                     {categories.map((cat, i) => (
//                         <Link
//                             key={i}
//                             href={`/category/${cat.toLowerCase()}`}
//                             prefetch={false} // 🔥 ADDED: Stops background 404s
//                             className="border border-zinc-800 bg-zinc-900/30 hover:border-rose-800/50 hover:bg-zinc-900 hover:text-white px-5 py-2 text-xs tracking-wider uppercase text-zinc-400 transition-all duration-300 rounded-sm"
//                         >
//                             {cat}
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* Trending Section (Above The Fold) */}
//             <div className="max-w-[1400px] mx-auto px-6 py-10">
//                 <div className="flex items-center gap-3 mb-8">
//                     <Flame className="text-rose-800" size={24} strokeWidth={1.5} />
//                     <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                         Trending Porn Videos
//                     </h2>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
//                     {trendingVideos.map((video, index) => (
//                         <Link
//                             key={video.id}
//                             href={`/watch/${video.id}/${video.slug}`}
//                             prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                             className="group block cursor-pointer"
//                         >
//                             <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
//                                 <Image
//                                     src={video.thumbnail}
//                                     alt={video.title}
//                                     fill
//                                     sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
//                                     priority={index < 4}
//                                     className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
//                                 />
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                                 <div className="absolute top-2 left-2 border border-white/20 bg-black/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-white">
//                                     HD
//                                 </div>
//                             </div>
//                             <div className="mt-3 px-1">
//                                 <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
//                                     {video.title}
//                                 </h3>
//                                 <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
//                                     {Number(video.views || 0).toLocaleString()} views
//                                 </p>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* Latest Uploads (Below The Fold) */}
//             <div className="bg-[#030303] border-y border-white/5">
//                 <div className="max-w-[1400px] mx-auto px-6 py-16">
//                     <div className="flex items-center justify-between mb-8">
//                         <div className="flex items-center gap-3">
//                             <Clock className="text-zinc-500" size={24} strokeWidth={1.5} />
//                             <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                                 Latest Porn Videos
//                             </h2>
//                         </div>
//                         <Link href="/latest" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
//                             View Directory
//                         </Link>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
//                         {latestVideos.map((video) => (
//                             <Link
//                                 key={video.id}
//                                 href={`/watch/${video.id}/${video.slug}`}
//                                 prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                                 className="group block cursor-pointer"
//                             >
//                                 <div className="relative overflow-hidden bg-zinc-900 aspect-video rounded-sm">
//                                     <Image
//                                         src={video.thumbnail}
//                                         alt={video.title}
//                                         fill
//                                         sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
//                                         className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-80 group-hover:opacity-100"
//                                     />
//                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                                     <div className="absolute top-2 left-2 border border-rose-800/50 bg-rose-900/40 backdrop-blur-sm text-[9px] uppercase tracking-widest px-2 py-1 text-rose-100">
//                                         NEW
//                                     </div>
//                                 </div>
//                                 <div className="mt-3 px-1">
//                                     <h3 className="font-light text-zinc-200 text-sm line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors duration-300">
//                                         {video.title}
//                                     </h3>
//                                     <p className="text-zinc-500 text-xs mt-1.5 font-light tracking-wide">
//                                         {Number(video.views || 0).toLocaleString()} views
//                                     </p>
//                                 </div>
//                             </Link>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//             {/* Top Pornstars Section */}
//             <div className="max-w-[1400px] mx-auto px-6 py-20">
//                 <div className="flex items-center justify-between mb-10">
//                     <div className="flex items-center gap-3">
//                         <Sparkles className="text-amber-600" size={24} strokeWidth={1.5} />
//                         <h2 className="text-2xl font-serif italic text-white tracking-wide">
//                             Top Pornstars
//                         </h2>
//                     </div>
//                     <Link href="/pornstars" className="text-rose-800 hover:text-rose-600 text-xs uppercase tracking-widest transition duration-300">
//                         View All Pornstars
//                     </Link>
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
//                     {topPornstars.map((star) => (
//                         <Link
//                             key={star.id}
//                             href={`/pornstars/${star.slug}`}
//                             prefetch={false} // 🔥 ADDED: Saves DB queries and fixes 404s
//                             className="group relative overflow-hidden rounded-sm cursor-pointer bg-zinc-900 aspect-[4/5]"
//                         >
//                             <Image
//                                 src={star.avatarUrl || "/thumbnails/default-avatar.png"}
//                                 alt={star.name}
//                                 fill
//                                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
//                                 className="object-cover transition duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
//                             <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
//                                 <h3 className="text-white font-serif italic text-xl tracking-wide mb-1">
//                                     {star.name}
//                                 </h3>
//                                 <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
//                                     <span>{Number(star.views || 0).toLocaleString()} views</span>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//             {/* === ADVERTISEMENT === */}
//             <div className="max-w-[1400px] mx-auto px-6 py-8 flex justify-center">
//                 <div className="border border-zinc-800/50 bg-black/30 rounded-sm p-3">
//                     <iframe
//                         style={{ backgroundColor: "white" }}
//                         width="315"
//                         height="300"
//                         scrolling="no"
//                         frameBorder="0"
//                         {...({ allowtransparency: "true" } as any)}
//                         marginHeight={0}
//                         marginWidth={0}
//                         name="spot_id_10002484"
//                         src="//a.adtng.com/get/10002484?ata=deviparvatilovemuslimcocks"
//                         title="Advertisement"
//                         loading="lazy"
//                     />
//                 </div>
//             </div>
//             {/* Upgraded Footer with Legal Links */}
//             <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
//                 <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
//                     <Link href="/dmca" className="hover:text-white transition duration-300">DMCA / Copyright</Link>
//                     <Link href="/privacy-policy" className="hover:text-white transition duration-300">Privacy Policy</Link>
//                     <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition duration-300">Terms of Service</Link>
//                     <Link href="/2257" className="hover:text-white transition duration-300">18 U.S.C. 2257</Link>
//                     <Link href="/contact" className="hover:text-white transition duration-300">Contact Us</Link>
//                 </div>
//                 <div className="text-xl tracking-widest mb-4">
//                     <span className="font-serif italic text-rose-800 pr-1">Porn</span>
//                     <span className="font-light text-zinc-600">Cater</span>
//                 </div>
//                 <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-2xl mx-auto px-6 leading-relaxed mb-4">
//                     All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
//                 </p>
//                 <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
//                     © {new Date().getFullYear()} • Exclusive Adult Cinema • 18+ Only
//                 </p>
//             </footer>
//         </div>
//     );
// }
