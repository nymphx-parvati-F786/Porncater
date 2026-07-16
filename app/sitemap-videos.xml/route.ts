import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = 'https://porncater.com';

// Helper to convert your "HH:MM:SS" database string into pure seconds for Google
function convertToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  if (parts.length === 2) return (parts[0] * 60) + parts[1];
  return 0;
}

export async function GET() {
  // Fetch your published scenes (Google hates broken links in sitemaps)
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      thumbnail: true,
      duration: true,
      views: true,
      createdAt: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10000, // Google limits sitemaps to 50k URLs, 10k is a safe, fast batch
  });

  // Build the raw XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  videos.forEach((video) => {
    const pageUrl = `${BASE_URL}/watch/${video.id}/${video.slug}`;
    const durationSeconds = convertToSeconds(video.duration);
    
    // Escape XML special characters to prevent crawler crashes
    const safeTitle = video.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeThumb = video.thumbnail.replace(/&/g, '&amp;');

    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl}</loc>\n`;
    xml += `    <video:video>\n`;
    xml += `      <video:thumbnail_loc>${safeThumb}</video:thumbnail_loc>\n`;
    xml += `      <video:title>${safeTitle}</video:title>\n`;
    xml += `      <video:description>Watch ${safeTitle} in free HD on PornCater.</video:description>\n`;
    xml += `      <video:player_loc allow_embed="yes">${BASE_URL}/embed/${video.id}</video:player_loc>\n`;
    xml += `      <video:duration>${durationSeconds}</video:duration>\n`;
    xml += `      <video:view_count>${video.views}</video:view_count>\n`;
    xml += `      <video:publication_date>${video.createdAt.toISOString()}</video:publication_date>\n`;
    xml += `      <video:family_friendly>no</video:family_friendly>\n`;
    
    // Inject up to 32 tags per video
    if (video.tags && video.tags.length > 0) {
      video.tags.slice(0, 10).forEach(tag => {
        const safeTag = tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `      <video:tag>${safeTag}</video:tag>\n`;
      });
    }
    
    xml += `    </video:video>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}