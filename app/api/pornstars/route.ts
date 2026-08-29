import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const takeCount = Math.min(200, Math.max(1, limitParam ? parseInt(limitParam, 10) : 50));

    const pornstars = await prisma.pornstar.findMany({
      take: takeCount,
      orderBy: { views: "desc" },
      include: {
        _count: { select: { videos: true } },
      },
    });

    const formattedPornstars = pornstars.map((star) => ({
      ...star,
      videoCount: star._count?.videos || 0,
    }));

    return NextResponse.json(formattedPornstars);
  } catch (error) {
    console.error("Database Error in /api/pornstars:", error);
    return NextResponse.json({ error: "Failed to fetch pornstars" }, { status: 500 });
  }
}
