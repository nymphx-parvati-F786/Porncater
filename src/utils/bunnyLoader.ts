export default function bunnyLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  // 1. Safety check: If it's a local relative path (like a default avatar), return it as-is
  if (src.startsWith('/')) {
    return src;
  }

  try {
    const url = new URL(src);
    
    // 2. Identify all your CDN hostnames (Custom CNAMEs + raw Bunny zones)
    const isBunnyZone = 
      url.hostname.includes('b-cdn.net') || 
      url.hostname.includes('img-s1-cdn.porncater.com') ||
      url.hostname.includes('bkcdn.net'); // Added from your PSI report

    if (isBunnyZone) {
      // 3. Inject Bunny Optimizer parameters
      url.searchParams.set('width', width.toString());
      url.searchParams.set('quality', (quality || 75).toString());
      
      // Optional: If you use Bunny's class-based optimization, uncomment below
      // url.searchParams.set('class', 'thumbnail'); 

      return url.toString();
    }
  } catch (error) {
    // If the URL is somehow malformed, fail gracefully and return the original string
    console.error("BunnyLoader failed to parse URL:", src);
    return src;
  }

  // Fallback for external URLs not on your CDN
  return src;
}