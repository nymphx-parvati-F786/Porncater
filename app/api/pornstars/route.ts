import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pornstars = await prisma.pornstar.findMany({
      orderBy: { views: 'desc' },
      
      // 1. Tell Prisma to dynamically count the joined videos
      include: {
        _count: {
          select: { videos: true }
        }
      }
    });

    // 2. Map the data so the frontend receives the 'videoCount' property it expects
    const formattedPornstars = pornstars.map(star => ({
      ...star,
      videoCount: star._count.videos // This creates the property on the fly!
    }));

    return NextResponse.json(formattedPornstars);
  } catch (error) {
    console.error("Database Error in /api/pornstars:", error);
    return NextResponse.json({ error: "Failed to fetch pornstars" }, { status: 500 });
  }
}