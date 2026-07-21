import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Cache this route on Vercel Edge CDN for 1 hour (3600s)
export const revalidate = 3600;

const BASE_URL = "https://porncater.com";

// Helper to convert "HH:MM:SS" or "MM:SS" database string into pure seconds for Google
function convertToSeconds(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// Robust XML Escaper for Google compliance
function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  // Fetch up to 45,000 published scenes (Google's hard limit per XML sitemap is 50,000)
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      thumbnail: true,
      videoUrl: true,
      duration: true,
      views: true,
      category: true,
      tags: true,
      createdAt: true,
      pornstars: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 45000,
  });

  // Construct XML header with official Schema specifications
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  videos.forEach((video) => {
    const pageUrl = `${BASE_URL}/watch/${video.id}/${video.slug}`;
    const durationSeconds = convertToSeconds(video.duration);

    const safeTitle = escapeXml(video.title);
    const safeThumb = escapeXml(video.thumbnail);
    const safeMediaUrl = escapeXml(video.videoUrl);
    const safeCategory = escapeXml(video.category || (video.tags?.[0] ? video.tags[0] : "Adult"));

    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl}</loc>\n`;
    xml += `    <video:video>\n`;
    xml += `      <video:thumbnail_loc>${safeThumb}</video:thumbnail_loc>\n`;
    xml += `      <video:title>${safeTitle}</video:title>\n`;
    xml += `      <video:description>Watch ${safeTitle} in free HD on PornCater.</video:description>\n`;
    
    // Direct stream URL + Embed Player URL for Googlebot deep indexing
    if (safeMediaUrl) {
      xml += `      <video:content_loc>${safeMediaUrl}</video:content_loc>\n`;
    }
    xml += `      <video:player_loc allow_embed="yes">${BASE_URL}/embed/${video.id}</video:player_loc>\n`;
    
    xml += `      <video:duration>${durationSeconds}</video:duration>\n`;
    xml += `      <video:view_count>${video.views || 0}</video:view_count>\n`;
    xml += `      <video:publication_date>${video.createdAt.toISOString()}</video:publication_date>\n`;
    xml += `      <video:family_friendly>no</video:family_friendly>\n`;
    xml += `      <video:category>${safeCategory}</video:category>\n`;

    // Extract tags and performer names into a unified tag list (Google permits up to 32 tags per video)
    const combinedTags = new Set<string>();

    if (video.tags && video.tags.length > 0) {
      video.tags.forEach((tag) => combinedTags.add(tag));
    }

    if (video.pornstars && video.pornstars.length > 0) {
      video.pornstars.forEach((star) => combinedTags.add(star.name));
    }

    // Output top 20 safe tags
    Array.from(combinedTags).slice(0, 20).forEach((tag) => {
      xml += `      <video:tag>${escapeXml(tag)}</video:tag>\n`;
    });

    xml += `    </video:video>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}