import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const pornstars = await prisma.pornstar.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(pornstars);
}