import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const starId = parseInt(resolvedParams.id);

    if (isNaN(starId)) {
      return NextResponse.json({ error: 'Invalid pornstar ID' }, { status: 400 });
    }

    const pornstar = await prisma.pornstar.findUnique({
      where: {
        id: starId,
      },
      // Include the count of their total porn videos for the UI stats bar
      include: {
        _count: {
          select: { videos: true }
        }
      }
    });

    if (!pornstar) {
      return NextResponse.json(
        { error: 'Pornstar not found in database' },
        { status: 404 }
      );
    }

    // Format the response so the frontend gets exactly what it expects
    const formattedStar = {
      ...pornstar,
      videoCount: pornstar._count.videos
    };

    return NextResponse.json(formattedStar);
  } catch (error) {
    console.error("Database Error in /api/pornstars/[id]:", error);
    return NextResponse.json(
      { error: 'Failed to fetch pornstar profile' },
      { status: 500 }
    );
  }
}
