import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Configuration
const VIDEO_DIRECTORY = '../local_videos_to_upload'; 

// Stream (Videos)
const STREAM_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || '';
const STREAM_API_KEY = process.env.BUNNY_API_KEY || '';
const STREAM_CDN = process.env.BUNNY_CDN || '';

// Storage (Thumbnails)
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || '';
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE || '';
const STORAGE_ENDPOINT = 'https://storage.bunnycdn.com';

// 🧠 SMART TAGGING
function autoGenerateTagsAndCategory(filename: string) {
  const lowerName = filename.toLowerCase();
  const tags: string[] = [];
  const dictionary: Record<string, string> = {
    'milf': 'MILF', 'teen': 'Teen', 'hardcore': 'Hardcore', 'anal': 'Anal',
    'desi': 'Desi', 'asian': 'Asian', 'ebony': 'Ebony', 'latina': 'Latina', 
    'blonde': 'Blonde', 'brunette': 'Brunette', 'pov': 'POV', 'creampie': 'Creampie'
  };

  for (const [key, value] of Object.entries(dictionary)) {
    if (lowerName.includes(key)) tags.push(value);
  }
  if (tags.length === 0) tags.push('Exclusive');
  return { tags, category: tags.length > 0 ? tags[0] : 'Exclusive' };
}

// ⏱️ EXTRACT DURATION
function getVideoDuration(filePath: string): string {
  try {
    const durationStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`).toString().trim();
    const totalSeconds = Math.round(parseFloat(durationStr));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    return "10:00";
  }
}

// 📸 EXTRACT THUMBNAIL
function generateThumbnail(videoPath: string, thumbPath: string) {
  try {
    execSync(`ffmpeg -y -i "${videoPath}" -ss 00:00:15.000 -vframes 1 "${thumbPath}"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 🚀 1. BUNNY STREAM UPLOAD (VIDEOS)
async function uploadVideoToStream(filePath: string, title: string) {
  // Step 1: Create the Video container to get the GUID
  const createRes = await fetch(`https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: { AccessKey: STREAM_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title })
  });
  
  if (!createRes.ok) throw new Error("Failed to create video in Bunny Stream");
  const { guid } = await createRes.json();

  // Step 2: Upload the actual .mp4 file into the GUID container
  const fileStream = fs.createReadStream(filePath);
  const uploadRes = await fetch(`https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}/videos/${guid}`, {
    method: 'PUT',
    headers: { AccessKey: STREAM_API_KEY, 'Content-Type': 'application/octet-stream' },
    // @ts-ignore
    body: fileStream,
    duplex: 'half'
  });

  if (!uploadRes.ok) throw new Error("Failed to upload video data to Bunny Stream");

  // Return the HLS streaming URL (standard for modern video players)
  return `https://${STREAM_CDN}/${guid}/playlist.m3u8`;
}

// 📦 2. BUNNY STORAGE UPLOAD (THUMBNAILS)
async function uploadThumbToStorage(filePath: string, fileName: string) {
  const fileStream = fs.createReadStream(filePath);
  // Upload to the /thumbnails/ folder in your storage zone
  const url = `${STORAGE_ENDPOINT}/${STORAGE_ZONE}/thumbnails/${fileName}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': 'application/octet-stream' },
    // @ts-ignore
    body: fileStream, 
    duplex: 'half'
  });

  if (!response.ok) throw new Error(`Bunny Storage upload failed: ${response.statusText}`);
  return `https://${STORAGE_PULLZONE}/thumbnails/${fileName}`;
}

// ⚙️ THE MAIN PIPELINE
async function runBulkUpload() {
  console.log("🚀 Starting Stream/Storage Bulk Pipeline...");

  if (!fs.existsSync(VIDEO_DIRECTORY)) fs.mkdirSync(VIDEO_DIRECTORY);
  const files = fs.readdirSync(VIDEO_DIRECTORY).filter(file => file.endsWith('.mp4'));
  if (files.length === 0) return console.log("No .mp4 files found.");

  for (const file of files) {
    console.log(`\n🎬 Processing: ${file}`);
    
    const videoPath = path.join(VIDEO_DIRECTORY, file);
    const cleanBaseName = file.toLowerCase().replace('.mp4', '').replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now();
    const finalThumbName = `${cleanBaseName}_${timestamp}.jpg`;
    const localThumbPath = path.join(VIDEO_DIRECTORY, finalThumbName);
    
    const title = file.replace('.mp4', '').replace(/[-_]/g, ' ');
    const { tags, category } = autoGenerateTagsAndCategory(file);
    const duration = getVideoDuration(videoPath);

    try {
      // 1. Generate local thumbnail
      generateThumbnail(videoPath, localThumbPath);

      // 2. Upload Video to STREAM
      console.log(`🌊 Uploading Video to Bunny Stream...`);
      const streamVideoUrl = await uploadVideoToStream(videoPath, title);
      
      // 3. Upload Thumbnail to STORAGE
      console.log(`📦 Uploading Thumbnail to Bunny Storage...`);
      const storageThumbUrl = await uploadThumbToStorage(localThumbPath, finalThumbName);

      // 4. Save to Database
      await prisma.video.create({
        data: {
          title: title,
          slug: `${cleanBaseName}-${timestamp}`,
          videoUrl: streamVideoUrl,   // Saves the HLS playlist URL
          thumbnail: storageThumbUrl, // Saves the Pullzone image URL
          duration: duration,
          category: category,
          tags: tags,
        }
      });
      console.log(`✅ Success! Database updated.`);

      // 5. Cleanup
      const donePath = path.join(VIDEO_DIRECTORY, 'completed');
      if (!fs.existsSync(donePath)) fs.mkdirSync(donePath);
      fs.renameSync(videoPath, path.join(donePath, file));
      if (fs.existsSync(localThumbPath)) fs.unlinkSync(localThumbPath);

    } catch (error) {
      console.error(`❌ Failed:`, error);
    }
  }
  console.log("\n🎉 Pipeline Complete!");
}

runBulkUpload()
  .catch(console.error)
  .finally(() => prisma.$disconnect());