import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 Force this route to be completely dynamic (no caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get("dimension");
    const studio = searchParams.get("studio");
    const category = searchParams.get("category");

    if (!dimension) {
      return NextResponse.json(
        { error: "Dimension parameter is required" },
        { status: 400 }
      );
    }

    // 1. Fetch matching active banners
    let banners = await prisma.banner.findMany({
      where: {
        dimension,
        isActive: true,
        campaign: {
          isActive: true,
          sponsor: { isActive: true },
        },
        ...(studio
          ? {
              OR: [
                { targetStudios: { has: studio } },
                { targetStudios: { isEmpty: true } },
              ],
            }
          : {}),
      },
      include: {
        campaign: {
          select: { baseLink: true, name: true },
        },
      },
    });

    // Fallback if nothing matched
    if (banners.length === 0) {
      banners = await prisma.banner.findMany({
        where: {
          dimension,
          isActive: true,
        },
        include: {
          campaign: { select: { baseLink: true, name: true } },
        },
      });
    }

    if (banners.length === 0) {
      return NextResponse.json(
        { error: "No active banners found for this slot" },
        { status: 404 }
      );
    }

    // 2. Weighted random selection
    const selected = selectWeightedBanner(banners);

    // Add tracking subid
    const trackingLinkWithSubId = `${selected.trackingLink}?subid=site_${selected.dimension}_${studio || "general"}`;

    return NextResponse.json(
      {
        id: selected.id,
        imageUrl: selected.imageUrl,
        trackingLink: trackingLinkWithSubId,
        dimension: selected.dimension,
        campaignName: selected.campaign?.name || null,
        weight: selected.weight,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Ad Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cleaner & more efficient weighted random
function selectWeightedBanner(banners: any[]) {
  const totalWeight = banners.reduce(
    (sum, b) => sum + (b.weight || 10),
    0
  );

  let random = Math.random() * totalWeight;

  for (const banner of banners) {
    const weight = banner.weight || 10;
    if (random < weight) {
      return banner;
    }
    random -= weight;
  }

  // Fallback (should almost never happen)
  return banners[banners.length - 1];
}