import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Add the request parameter to read the incoming URL
export async function GET(request: Request) {
  try {
    // 2. Parse the URL to look for the ?limit= param
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    
    // 3. If a limit exists, use it. Otherwise, default to 50 for the main directory.
    const takeCount = limitParam ? parseInt(limitParam) : 50;

    const pornstars = await prisma.pornstar.findMany({
      take: takeCount, // 4. Tell Prisma exactly how many to fetch
      orderBy: { views: 'desc' },
      
      // Tell Prisma to dynamically count the joined videos
      include: {
        _count: {
          select: { videos: true }
        }
      }
    });

    // Map the data so the frontend receives the 'videoCount' property it expects
    const formattedPornstars = pornstars.map(star => ({
      ...star,
      videoCount: star._count.videos
    }));

    return NextResponse.json(formattedPornstars);
  } catch (error) {
    console.error("Database Error in /api/pornstars:", error);
    return NextResponse.json({ error: "Failed to fetch pornstars" }, { status: 500 });
  }
}