import { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar"; 

// =========================================================
// 🚀 SEO ENGINE (DMCA METADATA)
// =========================================================
export const metadata: Metadata = {
  title: "DMCA Copyright Policy | PornCater",
  description: "Digital Millennium Copyright Act (DMCA) Notice and Takedown Policy for PornCater. We respect intellectual property rights and strictly adhere to copyright laws.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">
      
      {/* Visually Hidden H1 Tag for SEO */}
      <h1 className="sr-only">DMCA Copyright Infringement Policy - PornCater</h1>

      {/* Navbar (Same as Homepage) */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl tracking-widest cursor-pointer hover:opacity-80 transition duration-300">
              <span className="font-serif italic text-rose-800 pr-1">Porn</span>
              <span className="font-light text-white">Cater</span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition duration-300">Home</Link>
              <Link href="/trending" className="hover:text-white transition duration-300">Trending</Link>
              <Link href="/pornstars" className="hover:text-white transition duration-300">Pornstars</Link>
              <Link href="/live" className="text-rose-700 flex items-center gap-2 transition duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse"></span> Live
              </Link>
            </div>
          </div>

          <SearchBar />

          {/* Auth */}
          <div className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/admin/upload" className="bg-zinc-100 text-black px-6 py-2 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              Upload
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Formatted for Legal Readability */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="border border-white/5 bg-[#0a0a0a] rounded-sm p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-serif italic text-white tracking-wide mb-8 border-b border-white/10 pb-4">
            Digital Millennium Copyright Act (DMCA) Policy
          </h2>

          <div className="space-y-8 text-sm text-zinc-400 font-light leading-relaxed">
            
            <section>
              <p>
                PornCater ("we," "us," or "our") respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), the text of which may be found on the U.S. Copyright Office website at <a href="http://www.copyright.gov/legislation/dmca.pdf" className="text-rose-700 hover:underline">http://www.copyright.gov</a>, we will respond expeditiously to claims of copyright infringement committed using the PornCater website (the "Site") that are reported to our Designated Copyright Agent, identified below.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">1. Notice of Infringement</h3>
              <p className="mb-4">
                If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to our Designated Copyright Agent.
              </p>
              <p className="mb-4">Upon receipt of a valid Notice, we will take whatever action, in our sole discretion, we deem appropriate, including removal of the challenged material from the Site.</p>
              <p className="font-medium text-zinc-300 mb-2">Your DMCA Notice must include the following information:</p>
              <ol className="list-decimal list-inside space-y-3 ml-2">
                <li><strong>Identify the copyrighted work:</strong> Provide a description of the copyrighted work that you claim has been infringed. If multiple works are covered by this Notice, you may provide a representative list.</li>
                <li><strong>Identify the infringing material:</strong> Provide a description of the material that you claim is infringing and needs to be removed. Provide the exact URL(s) or link(s) to the specific pages on PornCater where the material is located. <em>(Note: General site URLs or search queries are not sufficient).</em></li>
                <li><strong>Contact Information:</strong> Provide your company affiliation (if applicable), mailing address, telephone number, and, if available, email address.</li>
                <li><strong>Good Faith Statement:</strong> Include the following statement: <em>"I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</em></li>
                <li><strong>Perjury Statement:</strong> Include the following statement: <em>"I swear, under penalty of perjury, that the information in the notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed."</em></li>
                <li><strong>Signature:</strong> Provide your full legal name and your physical or electronic signature.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">2. Designated Copyright Agent</h3>
              <p className="mb-2">Deliver the complete Notice, with all items completed, to our Designated Copyright Agent via email:</p>
              <div className="bg-black/50 p-4 border border-white/5 rounded-sm my-4 inline-block">
                <p className="text-white font-medium">Email: <a href="mailto:dmca@porncater.com" className="text-rose-600 hover:text-rose-500 transition-colors">dmca@porncater.com</a></p>
                <p className="text-xs text-zinc-500 mt-2">Note: Emails sent to this address with attachments will be automatically deleted for security reasons. Please send plain text emails only.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">3. Counter-Notification</h3>
              <p className="mb-4">
                If you believe that your content was removed (or access was disabled) by mistake or misidentification, you may send us a Counter-Notice containing the following information:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-2">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the material that has been removed and the exact URL/location at which the material appeared before it was removed.</li>
                <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.</li>
                <li>Your name, address, telephone number, and email address.</li>
                <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or if your address is outside the USA, for any judicial district in which PornCater may be found), and that you will accept service of process from the person who provided the original DMCA notification.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">4. Repeat Infringer Policy</h3>
              <p>
                In accordance with the DMCA and other applicable laws, PornCater has adopted a policy of terminating, in appropriate circumstances and at our sole discretion, the accounts of users who are deemed to be repeat infringers. We may also at our sole discretion limit access to the Site and/or terminate the accounts of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Upgraded Footer with Legal Links */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">
        
        {/* NEW: Professional Legal Navigation */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
          <Link href="/dmca" className="text-rose-700 hover:text-rose-500 transition duration-300">DMCA / Copyright</Link>
          <Link href="/privacy" className="hover:text-white transition duration-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition duration-300">Terms of Service</Link>
          <Link href="/2257" className="hover:text-white transition duration-300">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-white transition duration-300">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-2xl mx-auto px-6 leading-relaxed mb-4">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
        </p>
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} • Exclusive Adult Cinema • 18+ Only
        </p>
      </footer>
    </div>
  );
}