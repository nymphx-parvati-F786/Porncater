import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;
const STREAM_GENERAL_FULL_SCENES_COLLECTION_ID = process.env.STREAM_GENERAL_FULL_SCENES_COLLECTION_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

// Helper to sanitize text
const generateSlug = (text: string) => {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const duration = formData.get('duration') as string;
    const tagsString = formData.get('tags') as string;
    const pornstarIdsString = formData.get('pornstarIds') as string;
    
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!title || !duration || !videoFile || !thumbnailFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = generateSlug(title);

    // ======================
    // Step 1: Parse Metadata Arrays
    // ======================
    // Convert "MILF, BBC, POV" into ["milf", "bbc", "pov"]
    const tagsArray = tagsString 
      ? tagsString.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) 
      : [];
      
    // The primary category is just the first tag
    const category = tagsArray.length > 0 ? tagsArray[0] : "Amateur";

    // Parse the JSON array of IDs ["1", "5", "12"] sent from the frontend
    let pornstarIds: number[] = [];
    try {
      pornstarIds = JSON.parse(pornstarIdsString).map(Number).filter((id: number) => !isNaN(id));
    } catch (e) {}

    // ======================
    // Step 2: Upload Video to Bunny Stream
    // ======================
    const createVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          collectionId: STREAM_GENERAL_FULL_SCENES_COLLECTION_ID 
        }),
      }
    );

    if (!createVideoRes.ok) return NextResponse.json({ error: 'Failed to create Bunny entry' }, { status: 500 });
    const { guid } = await createVideoRes.json();

    const uploadVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`,
      {
        method: 'PUT',
        headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': videoFile.type },
        body: videoFile,
      }
    );

    if (!uploadVideoRes.ok) return NextResponse.json({ error: 'Video binary upload failed' }, { status: 500 });

    // ======================
    // Step 3: Upload Thumbnail to Bunny Storage
    // ======================
    // Extract file extension cleanly
    const thumbExt = thumbnailFile.name.split('.').pop() || 'jpg';
    const thumbnailPath = `thumbnails/${slug}-${Date.now()}.${thumbExt}`;

    const uploadThumbnail = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`,
      {
        method: 'PUT',
        headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': thumbnailFile.type },
        body: thumbnailFile,
      }
    );

    if (!uploadThumbnail.ok) return NextResponse.json({ error: 'Thumbnail upload failed' }, { status: 500 });

    // ======================
    // Step 4: Build CDN URLs
    // ======================
    const videoUrl = `https://${BUNNY_CDN}/${guid}/playlist.m3u8`;
    const thumbnailUrl = `https://${STORAGE_PULLZONE}/${thumbnailPath}`;

    // ======================
    // Step 5: Save to Supabase (Prisma)
    // ======================
    const newVideo = await prisma.video.create({
      data: {
        title,
        slug,
        videoUrl,
        thumbnail: thumbnailUrl,
        duration,
        category,
        tags: tagsArray,
        status: "PUBLISHED",
        views: Math.floor(Math.random() * 500) + 100, // Fake initial view boost
        
        // 🔥 Connect all selected pornstars seamlessly
        ...(pornstarIds.length > 0 && {
          pornstars: {
            connect: pornstarIds.map(id => ({ id }))
          }
        })
      },
    });

    return NextResponse.json({ success: true, video: newVideo });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Server processing failed', details: error.message }, { status: 500 });
  }
}