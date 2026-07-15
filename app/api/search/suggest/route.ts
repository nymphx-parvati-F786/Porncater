import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  // If the query is less than 2 characters, don't bother the database
  if (!q || q.length < 2) {
    return NextResponse.json({ videos: [], pornstars: [] });
  }

  try {
    // Run both queries at the exact same time for maximum speed
    const [videos, pornstars] = await Promise.all([
      // Grab top 3 videos
      prisma.video.findMany({
        where: { 
          status: 'PUBLISHED', 
          title: { contains: q, mode: 'insensitive' } 
        },
        take: 3,
        orderBy: { views: 'desc' },
        select: { id: true, slug: true, title: true, thumbnail: true, duration: true }
      }),
      // Grab top 2 matching pornstars
      prisma.pornstar.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 2,
        orderBy: { views: 'desc' },
        select: { id: true, slug: true, name: true, avatarUrl: true }
      })
    ]);

    return NextResponse.json({ videos, pornstars });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}