import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 pt-12 pb-8 text-center bg-[#050505] mt-auto w-full">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 text-[10px] uppercase tracking-widest text-zinc-600 font-bold px-4">
        <Link href="/dmca" className="hover:text-zinc-300 transition-colors">
          DMCA / Copyright
        </Link>
        <Link href="/privacy-policy" className="hover:text-zinc-300 transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-rose-600 hover:text-rose-500 transition-colors">
          Terms of Service
        </Link>
        <Link href="/2257" className="hover:text-zinc-300 transition-colors">
          18 U.S.C. 2257
        </Link>
        <Link href="/channels" className="hover:text-zinc-300 transition-colors">
          Channels
        </Link>
        <Link href="/contact" className="hover:text-zinc-300 transition-colors">
          Contact Us
        </Link>
      </div>

      <div className="text-lg tracking-widest mb-3">
        <span className="font-serif italic text-rose-600 pr-1">Porn</span>
        <span className="font-light text-zinc-700">Cater</span>
      </div>
      
      <p className="text-zinc-700 text-[9px] uppercase font-bold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-4">
        All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography.
      </p>

      <p className="text-zinc-800 text-[9px] font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
      </p>
    </footer>
  );
}