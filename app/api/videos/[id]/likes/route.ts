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
    
    // Parse the request body to see if the user is liking or unliking
    const body = await request.json();
    const isLiking = body.isLiking;

    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID format' }, { status: 400 });
    }

    // Use Prisma's atomic increment/decrement to prevent race conditions
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        likes: {
          [isLiking ? 'increment' : 'decrement']: 1,
        },
      },
      select: {
        id: true,
        likes: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      likes: updatedVideo.likes 
    });
  } catch (error) {
    console.error("Failed to update likes:", error);
    return NextResponse.json(
      { error: 'Failed to update like metric' },
      { status: 500 }
    );
  }
}