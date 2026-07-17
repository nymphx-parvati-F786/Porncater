import Image from 'next/image';

interface AffiliateBannerProps {
  targetUrl: string;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
  className?: string;
}

export default function AffiliateBanner({ targetUrl, imageUrl, altText, width, height, className = '' }: AffiliateBannerProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <a 
        href={targetUrl}
        target="_blank"
        // 🔥 THE HOLY GRAIL OF AD SEO: 
        // noopener noreferrer = Security against malicious ads hijacking the window
        // nofollow sponsored = Tells Google this is a paid affiliate link, protecting your Domain Authority
        rel="noopener noreferrer nofollow sponsored"
        className="block relative rounded-sm overflow-hidden border border-zinc-800 hover:border-rose-800 transition-colors shadow-lg"
        style={{ width: '100%', maxWidth: width, aspectRatio: `${width}/${height}` }}
      >
        <Image 
          src={imageUrl}
          alt={altText}
          fill
          unoptimized // Affiliate network images often block Next.js optimization servers, so we pass it straight through
          className="object-cover"
        />
        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[8px] tracking-widest text-zinc-400 uppercase rounded-sm z-10 pointer-events-none">
          Ad
        </div>
      </a>
    </div>
  );
}