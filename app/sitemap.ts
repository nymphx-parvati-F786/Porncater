import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Your actual production domain
const BASE_URL = 'https://porncater.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch the latest videos from Supabase
  // We take 10,000 to stay well under Google's 50,000 URL limit per sitemap, 
  // while keeping the Vercel serverless function fast.
  const videos = await prisma.video.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10000, 
  });

  // 2. Fetch the pornstars
  const pornstars = await prisma.pornstar.findMany({
    select: { id: true },
    take: 1000,
  });

  // 3. Map the Video URLs
  const videoUrls = videos.map((video) => ({
    url: `${BASE_URL}/watch/${video.id}`,
    lastModified: video.createdAt,
    changeFrequency: 'never' as const, // Videos usually don't change once uploaded
    priority: 0.8,
  }));

  // 4. Map the Pornstar URLs
  const pornstarUrls = pornstars.map((star) => ({
    url: `${BASE_URL}/pornstars/${star.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 5. Define your Static Core Routes
  const categories = ["desi", "lesbian", "milf", "teen", "hardcore"]; // Add your main ones
  
  const staticRoutes = [
    '',             // Homepage
    '/trending',
    '/videos/latest',
    '/pornstars',
    ...categories.map(cat => `/category/${cat}`)
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const, // These pages update often as new content flows in
    priority: route === '' ? 1.0 : 0.9, // Homepage gets top priority
  }));

  // 6. Combine and return the full array
  return [...staticRoutes, ...videoUrls, ...pornstarUrls];
}