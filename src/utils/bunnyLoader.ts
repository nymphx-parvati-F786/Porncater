export default function bunnyLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  // If it's a BunnyCDN image, slap the optimizer query parameters on it
  if (src.includes('b-cdn.net')) {
    return `${src}?width=${width}&quality=${quality || 75}`; 
  }
  
  // If it's a local image or something else, just return the normal source
  return src;
}