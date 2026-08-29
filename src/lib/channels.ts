import { prisma } from "@/lib/prisma";
import { studioSlug } from "@/src/lib/site";
import {
  AFFILIATE_CHANNELS,
  type AffiliateTier,
} from "@/src/data/affiliateChannels";

export type ChannelCard = {
  studio: string;
  slug: string;
  videoCount: number;
  totalViews: number;
  thumbnail: string | null;
  officialUrl: string | null;
  isNetwork: boolean;
  niche: string;
  program: string;
  tier: AffiliateTier | null;
  siteType: string;
  rank: number;
};

type StudioRow = {
  studio: string;
  videoCount: number;
  totalViews: bigint | number;
  thumbnail: string | null;
};

export async function listChannels(): Promise<ChannelCard[]> {
  try {
    return await listChannelsUnsafe();
  } catch (error) {
    console.error("listChannels failed:", error);
    return AFFILIATE_CHANNELS.map((channel) => catalogToCard(channel));
  }
}

function catalogToCard(
  channel: (typeof AFFILIATE_CHANNELS)[number],
  extra?: Partial<ChannelCard>,
): ChannelCard {
  return {
    studio: channel.name,
    slug: channel.slug,
    videoCount: 0,
    totalViews: 0,
    thumbnail: extra?.thumbnail ?? null,
    officialUrl: extra?.officialUrl ?? channel.url,
    isNetwork: channel.siteType === "Hub" || channel.siteType === "Bundle",
    niche: channel.niche,
    program: channel.program,
    tier: channel.tier,
    siteType: channel.siteType,
    rank: channel.rank,
    ...extra,
  };
}

async function listChannelsUnsafe(): Promise<ChannelCard[]> {
  const rows = await prisma.$queryRaw<StudioRow[]>`
    WITH studio_stats AS (
      SELECT
        LOWER(BTRIM(studio)) AS studio_key,
        (ARRAY_AGG(studio ORDER BY LENGTH(studio) DESC))[1] AS studio,
        COUNT(*)::int AS "videoCount",
        COALESCE(SUM(views), 0) AS "totalViews"
      FROM "Video"
      WHERE status = 'PUBLISHED'
        AND studio IS NOT NULL
        AND BTRIM(studio) <> ''
      GROUP BY LOWER(BTRIM(studio))
    )
    SELECT
      s.studio,
      s."videoCount",
      s."totalViews",
      thumb.thumbnail
    FROM studio_stats s
    LEFT JOIN LATERAL (
      SELECT v2.thumbnail
      FROM "Video" v2
      WHERE v2.status = 'PUBLISHED'
        AND LOWER(BTRIM(v2.studio)) = s.studio_key
        AND v2.thumbnail IS NOT NULL
        AND v2.thumbnail <> ''
      ORDER BY v2.views DESC
      LIMIT 1
    ) thumb ON true
    ORDER BY s."videoCount" DESC
  `;

  const bySlug = new Map<string, ChannelCard>();

  for (const item of AFFILIATE_CHANNELS) {
    bySlug.set(item.slug, catalogToCard(item));
  }

  for (const row of rows) {
    const slug = studioSlug(row.studio);
    const existing = bySlug.get(slug);
    const stats = {
      videoCount: Number(row.videoCount),
      totalViews: Number(row.totalViews),
      thumbnail: row.thumbnail,
    };
    if (existing) {
      existing.videoCount = stats.videoCount;
      existing.totalViews = stats.totalViews;
      if (stats.thumbnail) existing.thumbnail = stats.thumbnail;
    } else {
      bySlug.set(slug, {
        studio: row.studio,
        slug,
        videoCount: stats.videoCount,
        totalViews: stats.totalViews,
        thumbnail: stats.thumbnail,
        officialUrl: null,
        isNetwork: false,
        niche: "",
        program: "",
        tier: null,
        siteType: "Channel",
        rank: 9999,
      });
    }
  }

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
    const existing = bySlug.get(slug);
    const banner = campaign.banners[0];
    let imageUrl = banner?.imageUrl || null;
    if (imageUrl?.startsWith("//")) imageUrl = "https:" + imageUrl;

    if (existing) {
      existing.officialUrl = campaign.baseLink;
      existing.isNetwork = true;
      if (!existing.thumbnail && imageUrl) existing.thumbnail = imageUrl;
    } else {
      bySlug.set(slug, {
        studio: sponsor.name,
        slug,
        videoCount: 0,
        totalViews: 0,
        thumbnail: imageUrl,
        officialUrl: campaign.baseLink,
        isNetwork: true,
        niche: "",
        program: "",
        tier: null,
        siteType: "Hub",
        rank: 5000,
      });
    }
  }

  return [...bySlug.values()].sort((a, b) => {
    const tierRank = (t: AffiliateTier | null) =>
      t === "S" ? 0 : t === "A" ? 1 : t === "B" ? 2 : t === "C" ? 3 : t === "D" ? 4 : 5;
    if (tierRank(a.tier) !== tierRank(b.tier)) return tierRank(a.tier) - tierRank(b.tier);
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount;
    return a.studio.localeCompare(b.studio);
  });
}

export async function getChannelBySlug(slug: string): Promise<ChannelCard | null> {
  const channels = await listChannels();
  return channels.find((c) => c.slug === slug) || null;
}

export function featuredChannels(channels: ChannelCard[], limit = 12): ChannelCard[] {
  const premium = channels.filter((c) => c.tier === "S" || c.tier === "A");
  const pool = premium.length >= limit ? premium : channels;
  return pool.slice(0, limit);
}
