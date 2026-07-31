import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;
const STREAM_GENERAL_FULL_SCENES_COLLECTION_ID = process.env.STREAM_GENERAL_FULL_SCENES_COLLECTION_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

// Helper to sanitize text into a URL-friendly slug
const generateSlug = (text: string) => {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Generates the secure cryptographic signature required by BunnyCDN for Direct TUS Uploads
function generateSignature(libraryId: string, apiKey: string, expirationTime: number, videoId: string) {
  const dataToSign = libraryId + apiKey + expirationTime + videoId;
  const hash = crypto.createHash('sha256');
  hash.update(dataToSign);
  return hash.digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const duration = formData.get('duration') as string;
    const tagsString = formData.get('tags') as string;
    const pornstarIdsString = formData.get('pornstarIds') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!title || !duration || !thumbnailFile) {
      return NextResponse.json({ error: 'Missing required metadata or thumbnail' }, { status: 400 });
    }

    const slug = generateSlug(title) + '-' + Math.floor(Math.random() * 10000); // Ensures unique slug for UGC
    
    const tagsArray = tagsString ? tagsString.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) : [];
    const category = tagsArray.length > 0 ? tagsArray[0] : "Amateur";

    let pornstarIds: number[] = [];
    try { pornstarIds = JSON.parse(pornstarIdsString).map(Number).filter((id: number) => !isNaN(id)); } catch (e) {}

    // ==========================================
    // 1. Create BLANK Video Shell in BunnyCDN
    // ==========================================
    const createVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, collectionId: STREAM_GENERAL_FULL_SCENES_COLLECTION_ID }),
      }
    );

    if (!createVideoRes.ok) return NextResponse.json({ error: 'Failed to create Bunny CDN entry' }, { status: 500 });
    const { guid } = await createVideoRes.json();

    // ==========================================
    // 2. Upload Thumbnail to Bunny Storage
    // ==========================================
    const thumbExt = thumbnailFile.name.split('.').pop() || 'jpg';
    const thumbnailPath = `thumbnails/ugc-${slug}-${Date.now()}.${thumbExt}`;

    const uploadThumbnail = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`,
      {
        method: 'PUT',
        headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': thumbnailFile.type },
        body: thumbnailFile,
      }
    );

    if (!uploadThumbnail.ok) return NextResponse.json({ error: 'Thumbnail upload failed' }, { status: 500 });

    // ==========================================
    // 3. Save to Prisma Database (AS PENDING!)
    // ==========================================
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
        status: "PENDING", // 🔥 SECURE: Requires admin approval to go live
        views: 0, // UGC starts at 0 views
        ...(pornstarIds.length > 0 && { pornstars: { connect: pornstarIds.map(id => ({ id })) } })
      },
    });

    // ==========================================
    // 4. Generate TUS Credentials for the Client
    // ==========================================
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour valid upload window
    const signature = generateSignature(BUNNY_LIBRARY_ID, BUNNY_API_KEY, expirationTime, guid);

    return NextResponse.json({ 
      success: true, 
      video: newVideo,
      tusAuth: {
        libraryId: BUNNY_LIBRARY_ID,
        videoId: guid,
        signature,
        expirationTime
      }
    });

  } catch (error: any) {
    console.error('UGC Upload Error:', error);
    return NextResponse.json({ error: 'Server processing failed', details: error.message }, { status: 500 });
  }
}