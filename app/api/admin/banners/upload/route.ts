import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

// Safer Sharp settings
sharp.cache(false);
sharp.concurrency(1);

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

function generateCleanWebpName(originalName: string, dimension: string): string {
  let base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase();

  base = base
    .replace(/blk[_-]?970x70/gi, "b970")
    .replace(/blk[_-]?300x250/gi, "b300")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_+$)/g, "");

  const shortHash = crypto.randomBytes(3).toString("hex");
  return `${base}_${dimension}_${shortHash}.webp`;
}

function getOptimizationSettings(dimension: string) {
  switch (dimension) {
    case "970x70":
      return { width: 970, height: 70, quality: 72, effort: 6 };
    case "300x250":
      return { width: 300, height: 250, quality: 76, effort: 6 };
    case "300x100":
      return { width: 300, height: 100, quality: 74, effort: 6 };
    case "160x600":
      return { width: 160, height: 600, quality: 75, effort: 6 };
    default:
      return { width: 300, height: 250, quality: 76, effort: 6 };
  }
}

export async function POST(req: Request) {
  try {
    if (!STORAGE_ZONE || !STORAGE_API_KEY || !STORAGE_PULLZONE) {
      throw new Error("Missing Bunny CDN environment variables");
    }

    const formData = await req.formData();

    const campaignId = formData.get("campaignId") as string;
    const trackingLink = formData.get("trackingLink") as string;
    const dimension = formData.get("dimension") as string;
    const weight = parseInt(formData.get("weight") as string) || 10;
    const rawStudios = formData.get("targetStudios") as string;
    const rawCategories = formData.get("targetCategories") as string;

    const file = formData.get("file") as File | null;
    let finalImageUrl = formData.get("imageUrl") as string;
    let finalSizeKB = 0;

    if (!campaignId || !trackingLink || !dimension) {
      return NextResponse.json(
        { error: "Missing required fields (campaignId, trackingLink, or dimension)" },
        { status: 400 }
      );
    }

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const rawBuffer = Buffer.from(new Uint8Array(arrayBuffer));

        const { width, height, quality, effort } = getOptimizationSettings(dimension);

        console.log(`Optimizing banner → ${dimension} | quality: ${quality}`);

        const webpBuffer = await sharp(rawBuffer)
          .resize({
            width,
            height,
            fit: "cover",
            position: "centre",
            withoutEnlargement: true,
          })
          .webp({
            quality,
            effort,
            smartSubsample: true,
            alphaQuality: 80,
          })
          .toBuffer();

        // 🔥 CRITICAL FIX: Force a clean normal Buffer
        // This removes the SharedArrayBuffer that fetch hates
        const safeBuffer = Buffer.from(webpBuffer);

        finalSizeKB = Math.round(safeBuffer.length / 1024);
        console.log(`Optimized size: ${finalSizeKB} KB`);

        if (finalSizeKB > 50) {
          return NextResponse.json(
            {
              error: `Optimized banner is still too large (${finalSizeKB} KB). Try a cleaner source image.`,
            },
            { status: 400 }
          );
        }

        const cleanFileName = generateCleanWebpName(file.name, dimension);
        const destinationPath = `media/creative_bnr/${cleanFileName}`;

        const uploadRes = await fetch(
          `https://storage.bunnycdn.com/${STORAGE_ZONE}/${destinationPath}`,
          {
            method: "PUT",
            headers: {
              AccessKey: STORAGE_API_KEY,
              "Content-Type": "image/webp",
            },
            body: safeBuffer, // ← use the clean buffer
          }
        );

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Bunny upload failed: ${errorText}`);
        }

        finalImageUrl = `https://${STORAGE_PULLZONE}/${destinationPath}`;
      } catch (processingError: any) {
        console.error("Image processing / upload error:", processingError);
        return NextResponse.json(
          {
            error: `Image processing failed: ${processingError.message}`,
          },
          { status: 500 }
        );
      }
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "No image file or imageUrl provided" },
        { status: 400 }
      );
    }

    const targetStudios = rawStudios
      ? rawStudios.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const targetCategories = rawCategories
      ? rawCategories.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const newBanner = await prisma.banner.create({
      data: {
        campaignId,
        dimension,
        imageUrl: finalImageUrl,
        trackingLink,
        weight,
        targetStudios,
        targetCategories,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      banner: newBanner,
      optimizedSizeKB: finalSizeKB,
      message: `Banner optimized to ${finalSizeKB} KB`,
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Server upload failed" },
      { status: 500 }
    );
  }
}