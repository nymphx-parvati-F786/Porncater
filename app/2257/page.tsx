import { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";
import {
  Play, User, Flame, Clock, Sparkles,
  MonitorPlay, Star, ThumbsUp, Filter,
  TrendingUp, Menu, Search, Video
} from "lucide-react"; 

// =========================================================
// 🚀 SEO ENGINE (2257 METADATA)
// =========================================================
export const metadata: Metadata = {
  title: "18 U.S.C. 2257 Compliance | PornCater",
  description: "18 U.S.C. Section 2257 compliance statement for PornCater. We maintain a strict zero-tolerance policy against illegal content.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function Compliance2257Page() {
  const megaCategories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
    "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
    "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
  ];
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* Visually Hidden H1 Tag for SEO */}
      <h1 className="sr-only">18 U.S.C. 2257 Record-Keeping Requirements Compliance - PornCater</h1>

      {/* =========================================
          🔥 SEXY FROSTED GLASS MEGA-HEADER
          ========================================= */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/90 flex flex-col transition-all">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden text-zinc-400 hover:text-white transition">
              <Menu size={28} />
            </button>
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>
          </div>
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="md:hidden text-zinc-400 hover:text-white transition">
              <Search size={24} />
            </button>
            <Link href="/admin/upload" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 backdrop-blur-sm">
              <Video size={16} /> Upload
            </Link>
            <Link href="/login" className="bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(190,18,60,0.4)]">
              Sign In
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide drop-shadow-md">
              <MonitorPlay size={18} /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <TrendingUp size={18} /> Trending
            </Link>
            <Link href="/latest" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Clock size={18} /> New Videos
            </Link>
            <Link href="/top-rated" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Star size={18} /> Top Rated
            </Link>
            <Link href="/pornstars" className="flex items-center gap-2 text-zinc-300 hover:text-white py-3 text-sm font-bold uppercase tracking-wide transition-colors">
              <Sparkles size={18} /> Pornstars
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/20">
          <div className="max-w-[1600px] mx-auto px-2 lg:px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 text-zinc-400 mr-2 shrink-0 px-2">
              <Filter size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Niches</span>
            </div>
            {megaCategories.map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.toLowerCase()}`}
                prefetch={false}
                className="whitespace-nowrap bg-white/5 hover:bg-rose-900/40 border border-white/5 hover:border-rose-700/60 text-zinc-300 hover:text-rose-100 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase transition-all rounded-sm shrink-0 backdrop-blur-md"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Formatted for Legal Readability */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="border border-white/5 bg-[#0a0a0a] rounded-sm p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-serif italic text-white tracking-wide mb-8 border-b border-white/10 pb-4">
            18 U.S.C. § 2257 Compliance Statement
          </h2>

          <div className="space-y-8 text-sm text-zinc-400 font-light leading-relaxed">
            
            <section>
              <p className="font-medium text-zinc-300 mb-4 uppercase tracking-wider text-xs">
                All models, actors, actresses, and other persons that appear in any visual depiction of actual or simulated sexually explicit conduct appearing on PornCater were over the age of eighteen (18) years at the time the visual depictions were created.
              </p>
              <p>
                PornCater ("the Site") operates strictly as an Internet Service Provider (ISP) and a content hosting platform. The Site, its owners, and its operators are not the primary producers of the visual depictions contained within the videos and images hosted on this website. All content is uploaded by third-party affiliates, studios, and independent content creators.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">1. Exemption from Record-Keeping Requirements</h3>
              <p className="mb-4">
                Because PornCater does not produce, direct, or hire performers for the content hosted on the platform, we are exempt from the primary record-keeping requirements under 18 U.S.C. § 2257 and 28 C.F.R. 75. 
              </p>
              <p>
                To the best of our knowledge, the primary producers of the content accessible via this website have complied with all record-keeping requirements as set forth by 18 U.S.C. § 2257. The required records are held by the original producers of the content.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">2. Custodian of Records</h3>
              <p className="mb-4">
                For content produced by professional studios and affiliate networks, the Custodian of Records is the respective producing entity. For specific inquiries regarding the primary producer of a particular video, you may contact our compliance team, and we will assist in directing your inquiry to the appropriate third-party producer.
              </p>
              <div className="bg-black/50 p-4 border border-white/5 rounded-sm my-4 inline-block">
                <p className="text-white font-medium">Compliance Contact: <a href="mailto:compliance@porncater.com" className="text-rose-600 hover:text-rose-500 transition-colors">compliance@porncater.com</a></p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">3. Zero-Tolerance Policy</h3>
              <p className="mb-4">
                PornCater maintains a strict, zero-tolerance policy against any visual depictions of minors or non-consensual content. We actively monitor our platform and utilize automated hashing and reporting tools to prevent the upload of illegal material.
              </p>
              <p>
                If you believe that any material on this website features individuals under the age of 18, or violates any laws, we urge you to report it immediately to our compliance department or utilize our DMCA takedown procedures. Upon notification, any infringing or illegal material will be permanently disabled, and the offending user's account will be terminated and reported to the appropriate law enforcement authorities (including the NCMEC).
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505]">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography. By entering this site you swear that you are of legal age in your area to view adult material and that you wish to view such material.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}