import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isActive: true },
      include: {
        sponsor: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}
