import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        duration: true,
        views: true,
        likes: true,
        category: true,
        tags: true,
        createdAt: true,
        pornstars: {
          select: { id: true, name: true, avatarUrl: true, slug: true },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found or removed" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Database Error in /api/videos/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}
