import { Metadata } from "next";

export const metadata: Metadata = {
  title: "18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement | PornCater",
  description: "Record-keeping requirements compliance statement for PornCater.",
};

export default function Exemption2257Page() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans py-20 px-6">
      <div className="max-w-[900px] mx-auto bg-[#0a0a0a] border border-white/10 p-10 md:p-16 rounded-sm shadow-2xl">
        <h1 className="text-3xl font-serif italic text-white mb-8 border-b border-white/10 pb-4">
          18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
        </h1>
        
        <div className="space-y-6 text-sm leading-relaxed font-light text-zinc-400">
          <p>
            All models, actors, actresses, and other persons that appear in any visual depiction of actual or simulated sexually explicit conduct appearing or otherwise contained in this Website were over the age of eighteen (18) years at the time the creation of such depictions were made.
          </p>
          <p>
            <strong>PornCater.com</strong> is not the primary producer of any of the visual content contained in the Website. PornCater operates as an Internet Computer Service Provider and/or Search Engine. All visual depictions displayed on this website are exempt from the provision of 18 U.S.C. § 2257 and 28 C.F.R. Part 75.
          </p>
          <p>
            To the best of PornCater’s knowledge, all content hosted on this platform was produced by third-party studios, webmasters, or users. PornCater does not produce, direct, or hire performers for any content. As such, PornCater qualifies for the exemption under 18 U.S.C. § 2257(h)(2)(B)(v) and 28 C.F.R. § 75.9.
          </p>
          <p>
            If you are the primary producer of any content on this site, you are solely responsible for keeping and maintaining the records required by 18 U.S.C. § 2257 and for providing the required compliance statements on your own website.
          </p>
          <p>
            PornCater holds a zero-tolerance policy against illegal content, including Non-Consensual Intimate Imagery (NCII) and Child Sexual Abuse Material (CSAM). Any such material found will be immediately removed and reported to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement agencies.
          </p>
          <p className="pt-8 text-zinc-500 text-xs">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}