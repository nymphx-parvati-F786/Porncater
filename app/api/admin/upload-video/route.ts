import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ⚠️ WARNING: Never hardcode API keys in your files!
// Move these to your .env file and use process.env to access them.
const BUNNY_LIBRARY_ID = '673639';
const BUNNY_API_KEY = '668e31ab-6ca9-4a67-8d758cec2dc2-5c4d-46c0';
const BUNNY_CDN = 'vz-dd9533b0-79d.b-cdn.net';

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const duration = formData.get('duration') as string;
    const category = formData.get('category') as string;
    const pornstarId = formData.get('pornstarId') as string;
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!title || !duration || !videoFile || !thumbnailFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // ======================
    // Step 1: Create Video Entry in Bunny Stream
    // ======================
    const createVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!createVideoRes.ok) {
      const err = await createVideoRes.text();
      return NextResponse.json({ error: 'Failed to create video entry', details: err }, { status: 500 });
    }

    const videoData = await createVideoRes.json();
    const videoGuid = videoData.guid;

    // ======================
    // Step 2: Upload Video File to Bunny Stream
    // ======================
    const uploadVideoRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': videoFile.type,
        },
        body: videoFile,
      }
    );

    if (!uploadVideoRes.ok) {
      const err = await uploadVideoRes.text();
      return NextResponse.json({ error: 'Failed to upload video file', details: err }, { status: 500 });
    }

    // ======================
    // Step 3: Upload Thumbnail to Bunny Storage
    // ======================
    const thumbnailPath = `thumbnails/${slug}-${Date.now()}.jpg`;

    const uploadThumbnail = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: STORAGE_API_KEY,
          'Content-Type': thumbnailFile.type,
        },
        body: thumbnailFile,
      }
    );

    if (!uploadThumbnail.ok) {
      return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 });
    }

    // ======================
    // Step 4: Build Final URLs
    // ======================
    const videoUrl = `https://${BUNNY_CDN}/${videoGuid}/playlist.m3u8`;
    const thumbnailUrl = `https://${STORAGE_PULLZONE}/${thumbnailPath}`;

    // ======================
    // Step 5: Save to Supabase
    // ======================
    const newVideo = await prisma.video.create({
      data: {
        title,
        slug,
        videoUrl,
        thumbnail: thumbnailUrl,
        duration,
        category: category || null,
        // ✅ FIX APPLIED HERE:
        pornstars: pornstarId 
          ? { connect: { id: parseInt(pornstarId) } } 
          : undefined,
      },
    });

    return NextResponse.json({ success: true, video: newVideo });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}