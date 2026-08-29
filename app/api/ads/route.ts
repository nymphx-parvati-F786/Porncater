import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get("dimension");
    const studio = searchParams.get("studio");

    if (!dimension) {
      return NextResponse.json({ error: "Dimension parameter is required" }, { status: 400 });
    }

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

    if (banners.length === 0) {
      banners = await prisma.banner.findMany({
        where: { dimension, isActive: true },
        include: {
          campaign: { select: { baseLink: true, name: true } },
        },
      });
    }

    if (banners.length === 0) {
      return NextResponse.json({ error: "No active banners found for this slot" }, { status: 404 });
    }

    const selected = selectWeightedBanner(banners);
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
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Ad Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function selectWeightedBanner<T extends { weight?: number | null }>(banners: T[]): T {
  const totalWeight = banners.reduce((sum, b) => sum + (b.weight || 10), 0);
  let random = Math.random() * totalWeight;
  for (const banner of banners) {
    const weight = banner.weight || 10;
    if (random < weight) return banner;
    random -= weight;
  }
  return banners[banners.length - 1];
}
