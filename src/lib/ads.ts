import { prisma } from "@/lib/prisma";

export type BannerAd = {
  imageUrl: string;
  trackingLink: string;
};

function normalize(banner: { imageUrl: string; trackingLink: string }): BannerAd {
  let imageUrl = banner.imageUrl;
  if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
  return { imageUrl, trackingLink: banner.trackingLink };
}

/**
 * Server-side banner pick for LCP slots.
 * Pass studio only on channel pages. Always falls back to the global slot
 * so an empty targeting list never blanks the banner.
 */
export async function getTopBannerAd(
  dimension: string,
  studio?: string,
): Promise<BannerAd | null> {
  try {
    if (studio) {
      const targeted = await prisma.banner.findFirst({
        where: {
          dimension,
          isActive: true,
          targetStudios: { has: studio },
        },
        orderBy: { weight: "desc" },
        select: { imageUrl: true, trackingLink: true },
      });
      if (targeted) return normalize(targeted);
    }

    const banner = await prisma.banner.findFirst({
      where: { dimension, isActive: true },
      orderBy: { weight: "desc" },
      select: { imageUrl: true, trackingLink: true },
    });

    return banner ? normalize(banner) : null;
  } catch {
    return null;
  }
}
