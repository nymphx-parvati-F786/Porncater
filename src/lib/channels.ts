import { prisma } from "@/lib/prisma";
import { studioSlug } from "@/src/lib/site";

export type ChannelCard = {
  studio: string;
  slug: string;
  videoCount: number;
  totalViews: number;
  thumbnail: string | null;
  officialUrl: string | null;
  isNetwork: boolean;
};

type StudioRow = {
  studio: string;
  videoCount: number;
  totalViews: bigint | number;
  thumbnail: string | null;
};

export async function listChannels(): Promise<ChannelCard[]> {
  const rows = await prisma.$queryRaw<StudioRow[]>`
    SELECT
      (ARRAY_AGG(v.studio ORDER BY LENGTH(v.studio) DESC))[1] AS studio,
      COUNT(*)::int AS "videoCount",
      COALESCE(SUM(v.views), 0) AS "totalViews",
      (
        SELECT v2.thumbnail
        FROM "Video" v2
        WHERE v2.status = 'PUBLISHED'
          AND LOWER(v2.studio) = LOWER(v.studio)
          AND v2.thumbnail IS NOT NULL
          AND v2.thumbnail <> ''
        ORDER BY v2.views DESC
        LIMIT 1
      ) AS thumbnail
    FROM "Video" v
    WHERE v.status = 'PUBLISHED'
      AND v.studio IS NOT NULL
      AND BTRIM(v.studio) <> ''
    GROUP BY LOWER(v.studio)
    ORDER BY COUNT(*) DESC
  `;

  const channels: ChannelCard[] = rows.map((row) => ({
    studio: row.studio,
    slug: studioSlug(row.studio),
    videoCount: Number(row.videoCount),
    totalViews: Number(row.totalViews),
    thumbnail: row.thumbnail,
    officialUrl: null,
    isNetwork: false,
  }));

  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true },
    include: {
      campaigns: {
        where: { isActive: true },
        take: 1,
        orderBy: { updatedAt: "desc" },
        include: {
          banners: {
            where: { isActive: true },
            take: 1,
            orderBy: { weight: "desc" },
            select: { imageUrl: true, trackingLink: true },
          },
        },
      },
    },
  });

  for (const sponsor of sponsors) {
    const campaign = sponsor.campaigns[0];
    if (!campaign) continue;
    const slug = studioSlug(sponsor.name);
    const existing = channels.find(
      (c) => c.slug === slug || c.studio.toLowerCase() === sponsor.name.toLowerCase(),
    );
    const banner = campaign.banners[0];
    let imageUrl = banner?.imageUrl || null;
    if (imageUrl?.startsWith("//")) imageUrl = "https:" + imageUrl;

    if (existing) {
      existing.officialUrl = campaign.baseLink;
      existing.isNetwork = true;
      if (!existing.thumbnail && imageUrl) existing.thumbnail = imageUrl;
    } else {
      channels.push({
        studio: sponsor.name,
        slug,
        videoCount: 0,
        totalViews: 0,
        thumbnail: imageUrl,
        officialUrl: campaign.baseLink,
        isNetwork: true,
      });
    }
  }

  channels.sort((a, b) => {
    if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount;
    if (Number(b.isNetwork) !== Number(a.isNetwork)) return Number(b.isNetwork) - Number(a.isNetwork);
    return a.studio.localeCompare(b.studio);
  });

  return channels;
}

export async function getChannelBySlug(slug: string): Promise<ChannelCard | null> {
  const channels = await listChannels();
  return channels.find((c) => c.slug === slug) || null;
}
