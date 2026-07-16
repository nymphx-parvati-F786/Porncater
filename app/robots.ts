import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 🔥 BLOCK CRAWLERS FROM INDEXING THIN CONTENT & ADMIN ROUTES
      disallow: [
        '/search?q=*', 
        '/admin/', 
        '/api/',
        '/embed/', // Don't let Google index the headless iframes as standalone pages
      ],
    },
    // Submit both your standard sitemap AND your new hardcore video sitemap
    sitemap: [
      'https://porncater.com/sitemap.xml',
      'https://porncater.com/sitemap-videos.xml'
    ],
  };
}