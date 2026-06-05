import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pornstarId = searchParams.get('pornstarId');
    
    // Grab the new parameters for browsing and searching
    const tag = searchParams.get('tag');
    const searchQuery = searchParams.get('q');

    let whereClause: any = {};
    
    // 1. Filter by Pornstar (Your existing logic)
    if (pornstarId) {
      whereClause.pornstars = {
        some: { id: parseInt(pornstarId) }
      };
    }

    // 2. Filter by Category/Tag (Case-insensitive check in Postgres array)
    if (tag) {
      whereClause.tags = {
        has: tag
      };
    }

    // 3. Filter by Search Bar Query (Title matching)
    if (searchQuery) {
      whereClause.title = {
        contains: searchQuery,
        mode: 'insensitive' // Ignores uppercase/lowercase
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