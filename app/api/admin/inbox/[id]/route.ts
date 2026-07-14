import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    
    // 🔥 THE FIX: We must await the params Promise before reading the ID
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Dynamically update whatever properties are sent (isRead or isTrashed)
    await prisma.inboxMessage.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Patch Error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}