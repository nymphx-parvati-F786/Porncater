import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = parseInt(resolvedParams.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID format' }, { status: 400 });
    }

    // ATOMIC INCREMENT: Updates the number directly in the database row 
    // without reading it first, preventing race conditions.
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      views: updatedVideo.views 
    });
  } catch (error) {
    console.error("Failed to increment views:", error);
    return NextResponse.json(
      { error: 'Failed to log view tracking metric' },
      { status: 500 }
    );
  }
}