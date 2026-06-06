import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pornstarParam = searchParams.get('pornstarId');
    const tag = searchParams.get('tag');
    const searchQuery = searchParams.get('q');

    let whereClause: any = {};
    
    // 1. Filter by Pornstar ID
    if (pornstarParam && pornstarParam !== 'undefined') {
      const parsedId = parseInt(pornstarParam);
      if (!isNaN(parsedId)) {
        whereClause.pornstars = { some: { id: parsedId } };
      } else {
        whereClause.pornstars = { some: { slug: pornstarParam } };
      }
    }

    // 2. Filter by Tag/Category
    if (tag) {
      whereClause.tags = { has: tag };
    }

    // 3. Filter by Search Query
    if (searchQuery) {
      whereClause.title = { contains: searchQuery, mode: 'insensitive' };
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        pornstars: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Database Error in /api/videos:", error);
    return NextResponse.json({ error: "Failed to fetch porn videos." }, { status: 500 });
  }
}