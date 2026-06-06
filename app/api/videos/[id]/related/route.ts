import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const currentVideoId = parseInt(resolvedParams.id);

    if (isNaN(currentVideoId)) {
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
    }

    // 1. Fetch the current video's DNA (Tags and Performers)
    const currentVideo = await prisma.video.findUnique({
      where: { id: currentVideoId },
      include: { pornstars: { select: { id: true } } }
    });

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const starIds = currentVideo.pornstars.map(star => star.id);
    const tags = currentVideo.tags || [];

    // 2. The Rabbit Hole Algorithm
    // Find videos that share EITHER the same pornstars OR the same tags
    const relatedVideos = await prisma.video.findMany({
      where: {
        // MUST NOT be the video they are already watching
        id: { not: currentVideoId },
        
        // MUST match at least one of these conditions
        OR: [
          ...(starIds.length > 0 ? [{ pornstars: { some: { id: { in: starIds } } } }] : []),
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
        ]
      },
      // Grab 10 recommendations to fill a beautiful grid
      take: 10,
      
      // Sort by views to ensure we are recommending proven, high-converting scenes
      orderBy: { views: 'desc' },
      
      include: {
        pornstars: {
          select: { id: true, name: true }
        }
      }
    });

    // 3. Fallback: If no direct matches (e.g., brand new site), just return the hottest videos
    if (relatedVideos.length === 0) {
      const fallbackVideos = await prisma.video.findMany({
        where: { id: { not: currentVideoId } },
        take: 10,
        orderBy: { views: 'desc' }
      });
      return NextResponse.json(fallbackVideos);
    }

    return NextResponse.json(relatedVideos);

  } catch (error) {
    console.error("Database Error in /api/videos/[id]/related:", error);
    return NextResponse.json({ error: "Failed to fetch related content." }, { status: 500 });
  }
}