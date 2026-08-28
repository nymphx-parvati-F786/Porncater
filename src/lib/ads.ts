import { prisma } from "@/lib/prisma";

export type BannerAd = {
  imageUrl: string;
  trackingLink: string;
};

/**
 * Server-side banner pick for LCP slots.
 * Weighted "first by weight" matches current homepage/watch behavior.
 * Do not add studio targeting here unless every caller is ready for empty-slot fallbacks.
 */
export async function getTopBannerAd(dimension: string): Promise<BannerAd | null> {
  try {
    const banner = await prisma.banner.findFirst({
      where: { dimension, isActive: true },
      orderBy: { weight: "desc" },
      select: { imageUrl: true, trackingLink: true },
    });

    if (!banner) return null;

    let imageUrl = banner.imageUrl;
    if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;

    return { imageUrl, trackingLink: banner.trackingLink };
  } catch {
    return null;
  }
}
