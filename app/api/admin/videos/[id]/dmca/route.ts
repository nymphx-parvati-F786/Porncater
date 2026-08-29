import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid Video ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const claimantName = typeof body.claimantName === "string" ? body.claimantName.slice(0, 120) : "";

    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "DMCA_TAKEDOWN",
        dmcaNotes: claimantName ? `Takedown requested by: ${claimantName}` : "DMCA Takedown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Video taken down securely",
    });
  } catch (error) {
    console.error("DMCA Takedown Error:", error);
    return NextResponse.json({ error: "Failed to process DMCA takedown" }, { status: 500 });
  }
}
