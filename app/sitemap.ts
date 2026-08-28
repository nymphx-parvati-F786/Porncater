import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, MEGA_CATEGORIES, categoryPath } from "@/src/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/latest`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/top-rated`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/pornstars`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const categoryPages: MetadataRoute.Sitemap = MEGA_CATEGORIES.map((cat) => ({
    url: `${SITE_URL}${categoryPath(cat)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const pornstars = await prisma.pornstar.findMany({
    select: { slug: true, updatedAt: true },
    take: 5000,
  });

  const pornstarPages: MetadataRoute.Sitemap = pornstars.map((star) => ({
    url: `${SITE_URL}/pornstars/${star.slug}`,
    lastModified: star.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...pornstarPages];
}
