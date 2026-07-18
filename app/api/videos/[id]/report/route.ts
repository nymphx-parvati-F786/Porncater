import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";           // ← Use your existing prisma instance
import { RecipientType } from "@prisma/client";  // ← Import the enum

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

    // Create report inside InboxMessage (properly structured)
    await prisma.inboxMessage.create({
      data: {
        fromEmail: email || "anonymous@porncater.com",
        fromName: "Video Report",
        subject: `URGENT REPORT: Video #${videoId} - ${reason}`,
        textBody: `Video ID: ${videoId}\nReason: ${reason}\n\nDescription: ${description || "No description provided."}`,
        
        // Create recipient properly using relation
        recipients: {
          create: {
            type: RecipientType.TO,
            email: "compliance@porncater.com",
            name: "Compliance Team",
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Report submitted successfully." 
    });

  } catch (error) {
    console.error("[Report API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}