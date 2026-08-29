export const SITE_URL = "https://www.porncater.com";
export const SITE_NAME = "PornCater";
export const SITE_HOST = "www.porncater.com";

/** Curated high-demand niches. Keep this list; do not auto-generate from random tags. */
export const MEGA_CATEGORIES = [
  "BBC",
  "Lesbian",
  "Cuckold",
  "Blowjob",
  "Creampie",
  "MILF",
  "Teen",
  "Anal",
  "Threesome",
  "Interracial",
  "Amateur",
  "BDSM",
  "POV",
  "Asian",
  "Ebony",
  "Latina",
  "Big Tits",
  "Cosplay",
  "Vintage",
  "VR",
] as const;

export type MegaCategory = (typeof MEGA_CATEGORIES)[number];

export function absUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function videoPath(id: number, slug: string): string {
  return `/video/${id}/${slug}`;
}

export function videoAbsUrl(id: number, slug: string): string {
  return absUrl(videoPath(id, slug));
}

export function categoryPath(name: string): string {
  return `/category/${name.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

export function pornstarPath(slug: string): string {
  return `/pornstars/${slug}`;
}

export function studioSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function channelPath(nameOrSlug: string): string {
  return `/channels/${studioSlug(nameOrSlug)}`;
}

export function parseDurationSeconds(
  seconds: number | string | null | undefined,
): number | null {
  if (seconds === null || seconds === undefined || seconds === "") return null;
  const raw = String(seconds).trim();
  if (!raw) return null;
  if (raw.includes(":")) {
    const parts = raw.split(":").map((p) => parseInt(p, 10));
    if (parts.some((n) => Number.isNaN(n))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.floor(num);
}

export function isTrailerDuration(
  seconds: number | string | null | undefined,
): boolean {
  const value = parseDurationSeconds(seconds);
  return value !== null && value > 0 && value < 180;
}

export function formatDuration(
  seconds: number | string | null | undefined,
): string | null {
  if (seconds === null || seconds === undefined || seconds === "") return null;

  const raw = String(seconds).trim();
  if (!raw) return null;

  if (raw.includes(":")) {
    const parts = raw.split(":").map((p) => parseInt(p, 10));
    if (parts.some((n) => Number.isNaN(n))) return null;
    if (parts.length === 2) {
      const [m, s] = parts;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    }
    if (parts.length === 3) {
      const [h, m, s] = parts;
      if (h <= 0) return `${m}:${s < 10 ? "0" : ""}${s}`;
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return null;
  }

  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return null;
  const total = Math.floor(num);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function formatDurationLabel(
  seconds: number | string | null | undefined,
): string {
  return formatDuration(seconds) ?? "";
}

export function formatIsoDuration(
  durationStr: string | null | undefined,
): string | undefined {
  if (!durationStr) return undefined;

  let totalSeconds = 0;
  if (typeof durationStr === "string" && durationStr.includes(":")) {
    const parts = durationStr.split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return undefined;
    if (parts.length === 3) totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) totalSeconds = parts[0] * 60 + parts[1];
    else return undefined;
  } else {
    totalSeconds = parseInt(String(durationStr), 10);
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return undefined;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let iso = "PT";
  if (hours > 0) iso += `${hours}H`;
  if (minutes > 0) iso += `${minutes}M`;
  if (seconds > 0 || iso === "PT") iso += `${seconds}S`;
  return iso;
}

export function publishedWhere() {
  return { status: "PUBLISHED" as const };
}
