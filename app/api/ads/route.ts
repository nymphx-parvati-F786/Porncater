import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get('dimension'); // e.g., "970x70"
    const studio = searchParams.get('studio');       // e.g., "Vixen" (Optional)
    const category = searchParams.get('category');   // e.g., "Anal" (Optional)

    if (!dimension) {
      return NextResponse.json({ error: 'Dimension parameter is required' }, { status: 400 });
    }

    // 1. Fetch active banners matching the dimension and active campaigns/sponsors
    const banners = await prisma.banner.findMany({
      where: {
        dimension: dimension,
        isActive: true,
        campaign: {
          isActive: true,
          sponsor: { isActive: true }
        },
        // 🔥 STUDIO TARGETING LOGIC: Match specific studio OR global banners (empty array)
        ...(studio ? {
          OR: [
            { targetStudios: { has: studio } },
            { targetStudios: { isEmpty: true } }
          ]
        } : {})
      },
      include: {
        campaign: { select: { baseLink: true, name: true } }
      }
    });

    if (banners.length === 0) {
      // Ultimate safety net fallback: grab any active banner of that dimension globally
      const fallbackBanners = await prisma.banner.findMany({
        where: { dimension, isActive: true },
        include: { campaign: { select: { baseLink: true } } }
      });

      if (fallbackBanners.length === 0) {
        return NextResponse.json({ error: 'No active banners found for this slot' }, { status: 404 });
      }
      
      return NextResponse.json(selectWeightedBanner(fallbackBanners, 'global_fallback'));
    }

    // 2. Return the winning banner based on your 'weight' priority math
    const selectedBanner = selectWeightedBanner(banners, studio || 'general');
    return NextResponse.json(selectedBanner);

  } catch (error: any) {
    console.error('Ad Server Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 🔥 WEIGHTED RANDOM SELECTION ALGORITHM
// Higher weight = mathematically higher chance of being picked
function selectWeightedBanner(banners: any[], placementContext: string) {
  const weightedPool: any[] = [];

  banners.forEach((banner) => {
    const weight = banner.weight || 10;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(banner);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  const winner = weightedPool[randomIndex];

  // Dynamically append the Sub-ID so your NATS dashboard tracks exact placement performance
  const trackingLinkWithSubId = `${winner.trackingLink}?subid=site_${winner.dimension}_${placementContext}`;

  return {
    id: winner.id,
    imageUrl: winner.imageUrl,
    trackingLink: trackingLinkWithSubId,
    dimension: winner.dimension,
    campaignName: winner.campaign.name
  };
}