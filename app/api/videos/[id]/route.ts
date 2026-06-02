import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = parseInt(resolvedParams.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID format' }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        // OPTIMIZATION: Only fetch the specific pornstar data needed for the Watch Page UI
        // This keeps the API response tiny and lightning fast.
        pornstars: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            slug: true
          }
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Porn video not found or removed' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Database Error in /api/videos/[id]:", error);
    return NextResponse.json(
      { error: 'Failed to fetch porn video from database' },
      { status: 500 }
    );
  }
}