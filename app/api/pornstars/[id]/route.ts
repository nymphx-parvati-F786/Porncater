import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const starId = parseInt(id, 10);

    if (isNaN(starId)) {
      return NextResponse.json({ error: "Invalid pornstar ID" }, { status: 400 });
    }

    const pornstar = await prisma.pornstar.findUnique({
      where: { id: starId },
      include: {
        _count: { select: { videos: true } },
      },
    });

    if (!pornstar) {
      return NextResponse.json({ error: "Pornstar not found in database" }, { status: 404 });
    }

    return NextResponse.json({
      ...pornstar,
      videoCount: pornstar._count.videos,
    });
  } catch (error) {
    console.error("Database Error in /api/pornstars/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch pornstar profile" }, { status: 500 });
  }
}
