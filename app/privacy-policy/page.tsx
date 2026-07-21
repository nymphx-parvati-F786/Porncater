import { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";
import {
  Play, User, Flame, Clock, Sparkles,
  MonitorPlay, Star, ThumbsUp, Filter,
  TrendingUp, Menu, Search, Video
} from "lucide-react"; 

// =========================================================
// 🚀 SEO ENGINE (PRIVACY METADATA)
// =========================================================
export const metadata: Metadata = {
  title: "Privacy Policy | PornCater",
  description: "Privacy Policy and data protection guidelines for PornCater. Learn how we handle, protect, and manage your data on our adult streaming platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const megaCategories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
    "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
    "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
  ];
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* Visually Hidden H1 Tag for SEO */}
      <h1 className="sr-only">Privacy Policy - PornCater</h1>

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
          <h2 className="text-3xl font-serif italic text-white tracking-wide mb-2">
            Privacy Policy
          </h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-sm text-zinc-400 font-light leading-relaxed">
            
            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">1. Age Restriction & Compliance</h3>
              <p className="mb-4">
                PornCater ("we," "us," or "our") operates a platform strictly limited to adults. You must be at least eighteen (18) years of age, or the age of majority in your jurisdiction, whichever is greater, to access or use this website. We do not knowingly collect, maintain, or use personal information from individuals under the age of 18. If we become aware that we have collected information from a minor, we will immediately and permanently delete such data from our systems.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">2. Information We Collect</h3>
              <p className="mb-4">We collect information to provide a better streaming experience, monitor site performance, and serve relevant advertisements. This includes:</p>
              <ul className="list-disc list-inside space-y-3 ml-2 text-zinc-300">
                <li><strong>Automatically Collected Information:</strong> IP addresses, browser types, operating systems, referring URLs, device identifiers, and pages interacted with. This is standard for all digital streaming platforms.</li>
                <li><strong>Usage Data:</strong> Video watch history, search queries, interactions with "Like" and "Share" buttons, and session durations.</li>
                <li><strong>Account Information:</strong> If you choose to register (where applicable), we may collect an email address and hashed password credentials.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">3. Cookies & Tracking Technologies</h3>
              <p className="mb-4">
                PornCater utilizes cookies, web beacons, and similar tracking technologies to enhance user experience and deliver targeted advertising. Cookies are small data files stored on your device. We use them for:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-2 mb-4 text-zinc-300">
                <li><strong>Essential Functions:</strong> Maintaining session states and ensuring secure navigation.</li>
                <li><strong>Analytics:</strong> Understanding traffic patterns and optimizing our CDN (Content Delivery Network) for faster video buffering.</li>
                <li><strong>Advertising:</strong> Third-party ad networks (see Section 4) use cookies to cap ad frequency and deliver relevant adult-oriented advertisements based on your browsing behavior.</li>
              </ul>
              <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some features of our site may not function properly.</p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">4. Third-Party Advertising & Affiliates</h3>
              <p className="mb-4">
                Our site features advertisements served by third-party adult advertising networks. These entities may collect non-personally identifiable information (such as your IP address or browser type) through cookies or pixel tags to display targeted ads. We do not share your private account data (like email addresses) with these networks. 
              </p>
              <p>
                By using PornCater, you consent to the routing of anonymized engagement metrics to these third-party traffic brokers in accordance with standard industry practices.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">5. User Rights (GDPR & CCPA)</h3>
              <p className="mb-4">Depending on your location, you may have specific rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-3 ml-2 text-zinc-300 mb-4">
                <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request the deletion of your personal data.</li>
                <li><strong>Do Not Sell My Personal Information:</strong> California residents (CCPA) may opt-out of the "sale" of their personal information to third parties.</li>
              </ul>
              <p>To exercise any of these rights, please contact our privacy compliance team via the email provided in Section 7.</p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">6. Data Security</h3>
              <p>
                We deploy industry-standard security measures, including SSL encryption, secure database environments, and regular vulnerability audits, to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">7. Contact Information</h3>
              <p className="mb-2">For any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our compliance department:</p>
              <div className="bg-black/50 p-4 border border-white/5 rounded-sm my-4 inline-block">
                <p className="text-white font-medium">Email: <a href="mailto:privacy@porncater.com" className="text-rose-600 hover:text-rose-500 transition-colors">privacy@porncater.com</a></p>
                <p className="text-xs text-zinc-500 mt-2">Please allow up to 72 hours for privacy-related inquiries to be processed.</p>
              </div>
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