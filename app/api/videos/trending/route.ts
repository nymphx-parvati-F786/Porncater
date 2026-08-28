import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "hot";

    const orderBy =
      filter === "adored"
        ? { likes: "desc" as const }
        : { views: "desc" as const };

    const videos = await prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: 20,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        duration: true,
        views: true,
        likes: true,
        pornstars: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Database Error in /api/videos/trending:", error);
    return NextResponse.json({ error: "Failed to calculate trending data." }, { status: 500 });
  }
}
