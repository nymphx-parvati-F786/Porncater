import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pornstarParam = searchParams.get("pornstarId");
    const tag = searchParams.get("tag");
    const searchQuery = searchParams.get("q");

    const whereClause: Record<string, unknown> = { status: "PUBLISHED" };

    if (pornstarParam && pornstarParam !== "undefined") {
      const parsedId = parseInt(pornstarParam, 10);
      if (!isNaN(parsedId)) {
        whereClause.pornstars = { some: { id: parsedId } };
      } else {
        whereClause.pornstars = { some: { slug: pornstarParam } };
      }
    }

    if (tag) {
      whereClause.tags = { has: tag };
    }

    if (searchQuery) {
      whereClause.title = { contains: searchQuery, mode: "insensitive" };
    }

    const videos = await prisma.video.findMany({
      take: 20,
      where: whereClause,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        duration: true,
        views: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Database Error in /api/videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos." }, { status: 500 });
  }
}
