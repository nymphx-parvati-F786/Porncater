import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update a specific email (e.g., Mark as Read, Move to Trash, Star)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first (Next.js 15+ requirement)
    const { id } = await params;
    const numericId = parseInt(id);
    
    const body = await request.json();

    // Only allow updating these specific fields for security
    const allowedUpdates = {
      ...(typeof body.isRead === "boolean" && { isRead: body.isRead }),
      ...(typeof body.isTrashed === "boolean" && { isTrashed: body.isTrashed }),
      ...(typeof body.isStarred === "boolean" && { isStarred: body.isStarred }),
    };

    const updatedMessage = await prisma.inboxMessage.update({
      where: { id: numericId },
      data: allowedUpdates,
    });

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// GET: Fetch a single email's full details (like the HTML body)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first (Next.js 15+ requirement)
    const { id } = await params;
    const numericId = parseInt(id);
    
    const message = await prisma.inboxMessage.findUnique({
      where: { id: numericId },
      include: {
        recipients: true,
        attachments: true,
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to fetch message:", error);
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
  }
}