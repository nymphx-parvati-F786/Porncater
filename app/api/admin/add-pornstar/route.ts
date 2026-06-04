import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ensure these are mapped in your .env file
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'thumbnails-porncater';
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || 'cdc1f21f-ec1b-4a1f-a7231f687261-0f42-4381';
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE || 'porncater-pullzone.b-cdn.net';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const tagsString = formData.get("tags") as string; // Will come as a comma-separated string
    const avatarFile = formData.get("avatar") as File | null;
    const coverFile = formData.get("cover") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Performer name is required." }, { status: 400 });
    }

    // 1. Generate SEO-friendly slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 2. Check for duplicate slug to prevent Prisma crash
    const existingStar = await prisma.pornstar.findUnique({
      where: { slug },
    });

    if (existingStar) {
      return NextResponse.json({ error: "A performer with this exact name already exists." }, { status: 409 });
    }

    let finalAvatarUrl = null;
    let finalCoverUrl = null;

    // 3. Upload Avatar to Bunny.net Storage (if provided)
    if (avatarFile) {
      const avatarPath = `thumbnails/pornstars/${slug}-${Date.now()}.jpg`;
      const uploadRes = await fetch(
        `https://storage.bunnycdn.com/${STORAGE_ZONE}/${avatarPath}`,
        {
          method: "PUT",
          headers: {
            AccessKey: STORAGE_API_KEY,
            "Content-Type": avatarFile.type,
          },
          body: avatarFile,
        }
      );

      if (!uploadRes.ok) throw new Error("Failed to upload avatar to edge storage.");
      finalAvatarUrl = `https://${STORAGE_PULLZONE}/${avatarPath}`;
    }

    // 4. Upload Cover Image to Bunny.net Storage (if provided)
    
    if (coverFile) {
      console.log("step working");
      
      const coverPath = `thumbnails/${slug}-${Date.now()}.jpg`;
      const uploadRes = await fetch(
        `https://storage.bunnycdn.com/${STORAGE_ZONE}/${coverPath}`,
        {
          method: "PUT",
          headers: {
            AccessKey: STORAGE_API_KEY,
            "Content-Type": coverFile.type,
          },
          body: coverFile,
        }
      );

      if (!uploadRes.ok) throw new Error("Failed to upload cover image to edge storage.");
      finalCoverUrl = `https://${STORAGE_PULLZONE}/${coverPath}`;
    }

    // 5. Parse Tags
    // Convert "Petite, Anal, Brunette" into an actual array for Prisma
    const tagsArray = tagsString 
      ? tagsString.split(',').map(t => t.trim()).filter(Boolean) 
      : [];

    // 6. Save to Supabase via Prisma
    const newPornstar = await prisma.pornstar.create({
      data: {
        name,
        slug,
        avatarUrl: finalAvatarUrl,
        coverImage: finalCoverUrl,
        bio: bio || null,
        tags: tagsArray,
      },
    });

    return NextResponse.json({ success: true, pornstar: newPornstar }, { status: 201 });
  } catch (error: any) {
    console.error("🔥 Error adding pornstar:", error);
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}

// Keep the GET request identical to before so your homepage feed works seamlessly
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");

    const pornstars = await prisma.pornstar.findMany({
      orderBy: { views: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(pornstars, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}