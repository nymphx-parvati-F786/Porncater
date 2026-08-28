import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentVideoId = parseInt(id, 10);

    if (isNaN(currentVideoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const currentVideo = await prisma.video.findUnique({
      where: { id: currentVideoId },
      select: {
        tags: true,
        pornstars: { select: { id: true } },
      },
    });

    if (!currentVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const starIds = currentVideo.pornstars.map((star) => star.id);
    const tags = currentVideo.tags || [];

    const relatedVideos = await prisma.video.findMany({
      where: {
        id: { not: currentVideoId },
        status: "PUBLISHED",
        OR: [
          ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []),
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : []),
        ],
      },
      take: 10,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        duration: true,
        views: true,
        pornstars: { select: { id: true, name: true } },
      },
    });

    if (relatedVideos.length === 0) {
      const fallbackVideos = await prisma.video.findMany({
        where: { id: { not: currentVideoId }, status: "PUBLISHED" },
        take: 10,
        orderBy: { views: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          duration: true,
          views: true,
        },
      });
      return NextResponse.json(fallbackVideos);
    }

    return NextResponse.json(relatedVideos);
  } catch (error) {
    console.error("Database Error in /api/videos/[id]/related:", error);
    return NextResponse.json({ error: "Failed to fetch related content." }, { status: 500 });
  }
}
