import { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/src/components/ui/SearchBar";
import SmartHeader from "@/src/components/ui/SmartHeader";

// =========================================================
// 🚀 SEO ENGINE (TOS METADATA)
// =========================================================
export const metadata: Metadata = {
  title: "Terms of Service | PornCater",
  description: "Terms of Service and user agreement for PornCater. Read our rules, user conduct guidelines, and legal disclaimers.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  const megaCategories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
    "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
    "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
  ];
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20">

      {/* Visually Hidden H1 Tag for SEO */}
      <h1 className="sr-only">Terms of Service - PornCater</h1>

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* Main Content Formatted for Legal Readability */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="border border-white/5 bg-[#0a0a0a] rounded-sm p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-serif italic text-white tracking-wide mb-2">
            Terms of Service
          </h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-sm text-zinc-400 font-light leading-relaxed">

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing, browsing, or using PornCater ("the Site," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions outlined in this agreement, you must immediately exit and cease all use of this website.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">2. Age Requirement & Legal Compliance</h3>
              <div className="border-l-2 border-rose-800 pl-4 py-1 mb-4 bg-rose-950/10">
                <p className="font-medium text-rose-200">
                  WARNING: THIS WEBSITE CONTAINS EXPLICIT ADULT MATERIAL.
                </p>
              </div>
              <p className="mb-4">
                You must be at least eighteen (18) years of age, or the age of majority in your legal jurisdiction, whichever is greater, to access this Site. By entering this Site, you swear and affirm under penalty of perjury that you are of legal age to view sexually explicit material and that accessing such material does not violate the laws of your community, city, state, or country.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">3. User Conduct and Prohibited Content</h3>
              <p className="mb-4">
                PornCater acts as a hosting and aggregation platform. As a user or content uploader, you agree NOT to upload, post, embed, or distribute any content that:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-2 text-zinc-300">
                <li>Features individuals under the age of 18 or otherwise violates 18 U.S.C. § 2257.</li>
                <li>Depicts non-consensual sexual acts, rape, or violence.</li>
                <li>Depicts bestiality, necrophilia, or any other illegal acts under U.S. and International law.</li>
                <li>Infringes upon the copyright, trademark, or intellectual property rights of any third party.</li>
              </ul>
              <p className="mt-4">
                We reserve the right to immediately terminate the account of any user found violating these rules and to report illegal content to the appropriate law enforcement agencies (including NCMEC).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">4. Third-Party Links & Affiliate Content</h3>
              <p className="mb-4">
                The Site contains embedded videos, advertising, and links to third-party websites and affiliate networks. We do not control, endorse, or monitor these external sites and are not responsible for their content, privacy policies, or business practices. Your interactions with third-party networks, including the purchase of premium memberships or clicking on advertisements, are solely between you and the third party.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">5. Disclaimer of Warranties</h3>
              <p className="mb-4">
                THE SITE AND ALL CONTENT, MATERIALS, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. We do not guarantee that the site will be uninterrupted, error-free, or completely secure from malicious software. You use the Site entirely at your own risk.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">6. Limitation of Liability</h3>
              <p className="mb-4">
                In no event shall PornCater, its owners, directors, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to, use of, or inability to use the Site. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">7. Indemnification</h3>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless PornCater and its affiliates from any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service or your use of the Site, including, but not limited to, any user contributions or uploads you make.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">8. Contact Information</h3>
              <p className="mb-2">For any legal inquiries or questions regarding these Terms of Service, please contact us at:</p>
              <div className="bg-black/50 p-4 border border-white/5 rounded-sm my-4 inline-block">
                <p className="text-white font-medium">Email: <a href="mailto:legal@porncater.com" className="text-rose-600 hover:text-rose-500 transition-colors">legal@porncater.com</a></p>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Upgraded Footer with Legal Links */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-center bg-[#020202]">

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium px-6">
          <Link href="/dmca" className="hover:text-white transition duration-300">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-white transition duration-300">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition duration-300">Terms of Service</Link>
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