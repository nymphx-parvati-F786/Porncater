import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Check if we are requesting videos for a specific pornstar
    const { searchParams } = new URL(request.url);
    const pornstarId = searchParams.get('pornstarId');

    let whereClause = {};
    
    // If a pornstar ID is passed, filter videos that include them in the many-to-many relation
    if (pornstarId) {
      whereClause = {
        pornstars: {
          some: { id: parseInt(pornstarId) }
        }
      };
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        pornstars: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json(videos);
} catch (error) {
    console.error("Database Error in /api/videos:", error);
    return NextResponse.json({ error: "Failed to fetch porn videos from database." }, { status: 500 });
  }
}