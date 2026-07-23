import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isActive: true },
      include: {
        sponsor: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}