// app/sitemap-videos.xml/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const CHUNK_SIZE = 5000;
const BASE_URL = "https://porncater.com";

export async function GET() {
  try {
    // Ultra-fast raw count query
    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "Video" WHERE status = 'PUBLISHED';
    `;
    
    const totalCount = Number(countResult[0]?.count || 0);
    const totalChunks = Math.max(1, Math.ceil(totalCount / CHUNK_SIZE));
    const nowISO = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (let i = 0; i < totalChunks; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${BASE_URL}/sitemap-videos/${i}</loc>\n`;
      xml += `    <lastmod>${nowISO}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to generate video sitemap index:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}