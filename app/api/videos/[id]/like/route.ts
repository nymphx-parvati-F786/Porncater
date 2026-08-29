import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 });
    }

    const ip = clientIp(request);
    const limited = rateLimit(`like:${ip}:${videoId}`, 8, 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Slow down" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const isLiking = Boolean(body.isLiking);
    const cookieName = `pc_lk_${videoId}`;
    const already = request.cookies.get(cookieName)?.value === "1";

    if (isLiking && already) {
      return NextResponse.json({ success: true, likes: null, duplicate: true });
    }
    if (!isLiking && !already) {
      return NextResponse.json({ success: true, likes: null, duplicate: true });
    }

    const delta = isLiking ? 1 : -1;
    await prisma.$executeRaw`
      UPDATE "Video"
      SET likes = GREATEST(likes + ${delta}, 0)
      WHERE id = ${videoId} AND status = 'PUBLISHED'
    `;

    const updated = await prisma.video.findUnique({
      where: { id: videoId },
      select: { likes: true },
    });

    const response = NextResponse.json({
      success: true,
      likes: updated?.likes ?? 0,
    });

    if (isLiking) {
      response.cookies.set(cookieName, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } else {
      response.cookies.delete(cookieName);
    }

    return response;
  } catch (error) {
    console.error("Failed to update likes:", error);
    return NextResponse.json({ error: "Failed to update like metric" }, { status: 500 });
  }
}
