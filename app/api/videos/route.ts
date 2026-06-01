import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        pornstar: true, // This will include pornstar info if linked
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
// Add this below the GET function

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const video = await prisma.video.create({
      data: {
        title: body.title,
        slug: body.title.toLowerCase().replace(/\s+/g, '-'),
        videoUrl: body.videoUrl,
        thumbnail: body.thumbnail,
        duration: body.duration,
        category: body.category,
        pornstarId: body.pornstarId || null,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}