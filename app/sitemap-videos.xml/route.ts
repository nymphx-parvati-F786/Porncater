import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const CHUNK_SIZE = 5000;
const BASE_URL = "https://porncater.com";

export async function GET() {
  // 1. Blazing fast raw count bypasses Prisma memory overhead
  const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Video" WHERE status = 'PUBLISHED';
  `;

  const totalCount = Number(countResult[0]?.count || 0);
  const totalChunks = Math.ceil(totalCount / CHUNK_SIZE);

  // 2. Build the Sitemap Index XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (let i = 0; i < totalChunks; i++) {
    xml += `  <sitemap>\n`;
    // 🔥 THE FIX: Points to the new folder structure URL
    xml += `    <loc>${BASE_URL}/sitemap-videos/${i}</loc>\n`;
    xml += `  </sitemap>\n`;
  }

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}