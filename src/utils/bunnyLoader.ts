export default function bunnyLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  if (src.startsWith('/')) return src;

  try {
    const url = new URL(src);
    const isBunnyZone = 
      url.hostname.includes('b-cdn.net') || 
      url.hostname.includes('img-s1-cdn.porncater.com') ||
      url.hostname.includes('bkcdn.net');

    if (isBunnyZone) {
      url.searchParams.set('width', width.toString());
      // 🔥 Hardcode quality to 45 for maximum speed, ignoring Next.js defaults
      url.searchParams.set('quality', '45');
      return url.toString();
    }
  } catch (error) {
    return src;
  }
  return src;
}