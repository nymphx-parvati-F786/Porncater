import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+
) {
  try {
    // =========================================================
    // 🛡️ CRITICAL SECURITY CHECK
    // =========================================================
    // Example: Checking an Authorization header. 
    // You MUST implement whatever admin auth you are using for your /admin/upload page here.
    // If you don't, trolls can hit this API and take down your videos.
    /*
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const resolvedParams = await params;
    const videoId = parseInt(resolvedParams.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid Video ID" }, { status: 400 });
    }
    
    const body = await request.json();
    const { claimantName } = body;

    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "DMCA_TAKEDOWN",
        // Using the exact schema field you created
        dmcaNotes: claimantName ? `Takedown requested by: ${claimantName}` : "DMCA Takedown",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Video taken down securely", 
      video 
    });
    
  } catch (error) {
    console.error("DMCA Takedown Error:", error);
    return NextResponse.json({ error: "Failed to process DMCA takedown" }, { status: 500 });
  }
}