import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = parseInt(resolvedParams.id);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const body = await req.json();
    const { reason, description, email } = body;

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    // 🔥 Routes the report directly into your existing InboxMessage table
    await prisma.inboxMessage.create({
      data: {
        to: "compliance@porncater.com",
        from: email || "anonymous@porncater.com",
        subject: `URGENT REPORT: Video #${videoId} - ${reason}`,
        body: `Video ID: ${videoId}\nReason: ${reason}\n\nDescription: ${description || "No description provided."}`,
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully." });
  } catch (error) {
    console.error("[Report API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}