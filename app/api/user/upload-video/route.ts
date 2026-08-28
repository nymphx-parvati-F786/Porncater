import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { clientIp, rateLimit } from "@/src/lib/rate-limit";

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;
const STREAM_GENERAL_FULL_SCENES_COLLECTION_ID = process.env.STREAM_GENERAL_FULL_SCENES_COLLECTION_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
};

function generateSignature(libraryId: string, apiKey: string, expirationTime: number, videoId: string) {
  const dataToSign = libraryId + apiKey + expirationTime + videoId;
  return crypto.createHash("sha256").update(dataToSign).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`upload:${ip}`, 4, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
    }

    if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY || !STORAGE_ZONE || !STORAGE_API_KEY || !STORAGE_PULLZONE || !BUNNY_CDN) {
      return NextResponse.json({ error: "Upload is temporarily unavailable." }, { status: 503 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim().slice(0, 180);
    const duration = String(formData.get("duration") || "").trim().slice(0, 16);
    const tagsString = String(formData.get("tags") || "");
    const pornstarIdsString = String(formData.get("pornstarIds") || "[]");
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!title || !duration || !thumbnailFile) {
      return NextResponse.json({ error: "Missing required metadata or thumbnail" }, { status: 400 });
    }

    if (thumbnailFile.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Thumbnail must be under 4MB" }, { status: 400 });
    }

    const allowedThumbs = ["image/jpeg", "image/png", "image/webp"];
    if (thumbnailFile.type && !allowedThumbs.includes(thumbnailFile.type)) {
      return NextResponse.json({ error: "Thumbnail must be JPG, PNG, or WebP" }, { status: 400 });
    }

    const slug = generateSlug(title) + "-" + Math.floor(Math.random() * 10000);
    const tagsArray = tagsString
      ? tagsString
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0)
          .slice(0, 12)
      : [];
    const category = tagsArray.length > 0 ? tagsArray[0] : "Amateur";

    let pornstarIds: number[] = [];
    try {
      pornstarIds = JSON.parse(pornstarIdsString)
        .map(Number)
        .filter((id: number) => !isNaN(id))
        .slice(0, 10);
    } catch {
      pornstarIds = [];
    }

    const createVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ title, collectionId: STREAM_GENERAL_FULL_SCENES_COLLECTION_ID }),
      },
    );

    if (!createVideoRes.ok) {
      return NextResponse.json({ error: "Failed to create CDN entry" }, { status: 500 });
    }
    const { guid } = await createVideoRes.json();

    const thumbExt = (thumbnailFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const thumbnailPath = `thumbnails/ugc-${slug}-${Date.now()}.${thumbExt}`;

    const uploadThumbnail = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`,
      {
        method: "PUT",
        headers: { AccessKey: STORAGE_API_KEY, "Content-Type": thumbnailFile.type || "image/jpeg" },
        body: thumbnailFile,
      },
    );

    if (!uploadThumbnail.ok) {
      return NextResponse.json({ error: "Thumbnail upload failed" }, { status: 500 });
    }

    const videoUrl = `https://${BUNNY_CDN}/${guid}/playlist.m3u8`;
    const thumbnailUrl = `https://${STORAGE_PULLZONE}/${thumbnailPath}`;

    const newVideo = await prisma.video.create({
      data: {
        title,
        slug,
        videoUrl,
        thumbnail: thumbnailUrl,
        duration,
        category,
        tags: tagsArray,
        status: "PENDING",
        views: 0,
        ...(pornstarIds.length > 0 && { pornstars: { connect: pornstarIds.map((id) => ({ id })) } }),
      },
      select: { id: true, slug: true, status: true },
    });

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const signature = generateSignature(BUNNY_LIBRARY_ID, BUNNY_API_KEY, expirationTime, guid);

    return NextResponse.json({
      success: true,
      video: newVideo,
      tusAuth: {
        libraryId: BUNNY_LIBRARY_ID,
        videoId: guid,
        signature,
        expirationTime,
      },
    });
  } catch (error) {
    console.error("UGC Upload Error:", error);
    return NextResponse.json({ error: "Server processing failed" }, { status: 500 });
  }
}
