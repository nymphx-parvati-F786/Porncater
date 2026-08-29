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
    const limited = rateLimit(`view:${ip}`, 40, 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ success: true, views: null });
    }

    const cookieName = `pc_vw_${videoId}`;
    if (request.cookies.get(cookieName)?.value === "1") {
      return NextResponse.json({ success: true, views: null, duplicate: true });
    }

    const updatedVideo = await prisma.video.updateMany({
      where: { id: videoId, status: "PUBLISHED" },
      data: { views: { increment: 1 } },
    });

    const response = NextResponse.json({
      success: true,
      counted: updatedVideo.count > 0,
    });
    response.cookies.set(cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 6,
    });
    return response;
  } catch (error) {
    console.error("Failed to increment views:", error);
    return NextResponse.json({ error: "Failed to log view tracking metric" }, { status: 500 });
  }
}
