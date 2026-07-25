// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://porncater.com';

  // Core Landing Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/latest`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/top-rated`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/pornstars`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Primary Categories
  const categories = [
    'bbc', 'lesbian', 'cuckold', 'blowjob', 'creampie', 'milf', 'teen',
    'anal', 'threesome', 'interracial', 'amateur', 'bdsm', 'pov',
    'asian', 'ebony', 'latina', 'big-tits', 'cosplay', 'vintage', 'vr'
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Performers Index
  const pornstars = await prisma.pornstar.findMany({
    select: { slug: true, updatedAt: true },
    take: 1000,
  });

  const pornstarPages: MetadataRoute.Sitemap = pornstars.map((star) => ({
    url: `${baseUrl}/pornstars/${star.slug}`,
    lastModified: star.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...pornstarPages];
}