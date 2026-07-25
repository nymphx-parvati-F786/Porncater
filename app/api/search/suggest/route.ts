import { prisma } from "@/lib/prisma"; // 🔥 FIX 1: Uses your singleton client, preventing Supabase connection pool crash
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  // If query is less than 2 characters, bypass DB entirely
  if (!q || q.length < 2) {
    return NextResponse.json({ videos: [], pornstars: [] });
  }

  try {
    // 🔥 FIX 2: Parallel Raw Trigram queries hit the GIN index and order by mathematical similarity
    const [videos, pornstars] = await Promise.all([
      // Grab top 5 matching videos ordered by similarity & popularity
      prisma.$queryRaw<Array<{ id: number; slug: string; title: string; thumbnail: string; duration: string }>>`
        SELECT id, slug, title, thumbnail, duration 
        FROM "Video"
        WHERE status = 'PUBLISHED' 
          AND (title % ${q} OR title ILIKE ${'%' + q + '%'})
        ORDER BY similarity(title, ${q}) DESC, views DESC
        LIMIT 5;
      `,
      // Grab top 3 matching pornstars ordered by similarity & views
      prisma.$queryRaw<Array<{ id: number; slug: string; name: string; avatarUrl: string | null }>>`
        SELECT id, slug, name, "avatarUrl" 
        FROM "Pornstar"
        WHERE name % ${q} OR name ILIKE ${'%' + q + '%'}
        ORDER BY similarity(name, ${q}) DESC, views DESC
        LIMIT 3;
      `
    ]);

    return NextResponse.json({ videos, pornstars });
  } catch (error) {
    console.error("Autocomplete Trigram API Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}