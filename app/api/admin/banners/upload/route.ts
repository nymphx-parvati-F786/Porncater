import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp'; // 🔥 NEW: The image optimizer

const prisma = new PrismaClient();

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

function generateCleanWebpName(originalName: string): string {
  let base = path.basename(originalName, path.extname(originalName)).toLowerCase();
  
  // Clean prefix noise and non-alphanumeric junk
  base = base.replace('blk-970x70', 'b970x70');
  base = base.replace(/[^a-z0-9]+/g, '_').replace(/(^_|$_)+/g, '');

  const shortHash = crypto.randomBytes(3).toString('hex');
  return `${base}-${shortHash}.webp`; // 🔥 FORCED WEBP EXTENSION
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const campaignId = formData.get('campaignId') as string;
    const trackingLink = formData.get('trackingLink') as string;
    const dimension = formData.get('dimension') as string;
    const weight = parseInt(formData.get('weight') as string) || 10;
    const rawStudios = formData.get('targetStudios') as string;
    const rawCategories = formData.get('targetCategories') as string;

    const file = formData.get('file') as File | null;
    let finalImageUrl = formData.get('imageUrl') as string;

    if (!campaignId || !trackingLink || !dimension) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. If an image file was uploaded, convert to WebP and push to Bunny
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);
      
      // 🔥 Convert the image to WebP with 80% compression quality
      const webpBuffer = await sharp(rawBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      const cleanFileName = generateCleanWebpName(file.name);
      const destinationFolder = `media/creative_bnr`;
      const destinationPath = `${destinationFolder}/${cleanFileName}`;

      const uploadRes = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${destinationPath}`, {
        method: 'PUT',
        headers: {
          AccessKey: STORAGE_API_KEY,
          'Content-Type': 'image/webp',
        },
        body: webpBuffer,
      });

      if (!uploadRes.ok) throw new Error(`Bunny CDN Upload Failed: ${await uploadRes.text()}`);

      finalImageUrl = `https://${STORAGE_PULLZONE}/${destinationPath}`;
    }

    if (!finalImageUrl) return NextResponse.json({ error: 'Provide an image file or a Bunny CDN URL' }, { status: 400 });

    const targetStudios = rawStudios ? rawStudios.split(',').map(s => s.trim()).filter(Boolean) : [];
    const targetCategories = rawCategories ? rawCategories.split(',').map(c => c.trim()).filter(Boolean) : [];

    // 2. Insert into Prisma
    const newBanner = await prisma.banner.create({
      data: {
        campaignId, dimension, imageUrl: finalImageUrl, trackingLink, weight, targetStudios, targetCategories, isActive: true,
      },
    });

    return NextResponse.json({ success: true, banner: newBanner });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Server upload failed' }, { status: 500 });
  }
}