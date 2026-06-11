import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Your actual production domain
const BASE_URL = 'https://porncater.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch the latest videos from Supabase
  // 🚀 UPDATE: We now select 'slug' along with 'id'
  const videos = await prisma.video.findMany({
    select: { id: true, slug: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10000, 
  });

  // 2. Fetch the pornstars
  // 🚀 UPDATE: We select 'slug' instead of 'id'
  const pornstars = await prisma.pornstar.findMany({
    select: { slug: true },
    take: 1000,
  });

  // 3. Map the Video URLs
  // 🚀 UPDATE: Matches the premium /watch/[id]/[slug] professional architecture
  const videoUrls = videos.map((video) => ({
    url: `${BASE_URL}/watch/${video.id}/${video.slug || 'scene'}`,
    lastModified: video.createdAt,
    changeFrequency: 'never' as const, 
    priority: 0.8,
  }));

  // 4. Map the Pornstar URLs
  // 🚀 UPDATE: Matches the clean /pornstars/[slug] alphanumeric path
  const pornstarUrls = pornstars.map((star) => ({
    url: `${BASE_URL}/pornstars/${star.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 5. Define your Static Core Routes
  const categories = ["desi", "lesbian", "milf", "teen", "hardcore"]; 
  
  const staticRoutes = [
    '',             // Homepage
    '/trending',
    '/videos/latest',
    '/pornstars',
    ...categories.map(cat => `/category/${cat}`)
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const, 
    priority: route === '' ? 1.0 : 0.9, 
  }));

  // 6. Combine and return the full array
  return [...staticRoutes, ...videoUrls, ...pornstarUrls];
}