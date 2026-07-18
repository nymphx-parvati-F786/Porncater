import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update a specific email (Mark as Read, Move to Trash, Star)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    const body = await request.json();

    // Only allow safe fields to be updated
    const allowedUpdates: any = {};
    if (typeof body.isRead === "boolean") allowedUpdates.isRead = body.isRead;
    if (typeof body.isTrashed === "boolean") allowedUpdates.isTrashed = body.isTrashed;
    if (typeof body.isStarred === "boolean") allowedUpdates.isStarred = body.isStarred;

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

// GET: Fetch single email details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    // Temporarily removed `include` to fix build error.
    // We will add it back after fixing Prisma types.
    const message = await prisma.inboxMessage.findFirst({
      where: { id: numericId },
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