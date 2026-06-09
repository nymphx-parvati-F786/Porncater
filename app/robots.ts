import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // CRITICAL: Block bots from wasting your Vercel/Supabase bandwidth
      disallow: ['/admin/', '/api/'], 
    },
    // Points bots directly to the dynamic sitemap we just built
    sitemap: 'https://porncater.com/sitemap.xml', 
  };
}