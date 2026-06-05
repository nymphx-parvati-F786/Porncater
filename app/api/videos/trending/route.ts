import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'hot'; // 'hot', 'adored', 'all-time'

    // Fetch the recent active catalog
    const videos = await prisma.video.findMany({
      take: 100, // Limit the pool to the 100 most relevant videos to save memory
      include: {
        pornstars: {
          select: { id: true, name: true }
        }
      }
    });

    let sortedVideos = [...videos];

    // THE SMART SORTING LOGIC
    if (filter === 'all-time') {
      // Standard sort by total raw views
      sortedVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
      
    } else if (filter === 'adored') {
      // Sort purely by user likes/adored clicks
      sortedVideos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      
    } else {
      // 'HOT RIGHT NOW' ALGORITHM
      // Score = (Likes * 10) + Views. 
      // In a production app with diverse dates, you would also divide this score by the days since upload to prioritize newer content!
      sortedVideos.sort((a, b) => {
        const scoreA = ((a.likes || 0) * 10) + (a.views || 0);
        const scoreB = ((b.likes || 0) * 10) + (b.views || 0);
        return scoreB - scoreA;
      });
    }

    // Return the top 20 results for the leaderboard
    return NextResponse.json(sortedVideos.slice(0, 20));
    
  } catch (error) {
    console.error("Database Error in /api/videos/trending:", error);
    return NextResponse.json({ error: "Failed to calculate trending data." }, { status: 500 });
  }
}