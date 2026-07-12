import { PrismaClient } from '@prisma/client';
import ytDlp from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Reconstruct __dirname for ES Modules execution context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Bunny.net Credentials from your .env file
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

// Temporary local directory for handling processing operations
const TEMP_DIR = path.join(__dirname, 'local_videos_to_upload');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// ------------------------------------------------------------------
// BUNNY.NET UPLOAD HELPERS
// ------------------------------------------------------------------
async function uploadToBunnyStream(title: string, filePath: string) {
  console.log(`[Bunny Stream] Creating entry for: ${title}`);

  const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) throw new Error('Failed to create Bunny Stream entry');
  const { guid } = await createRes.json();

  console.log(`[Bunny Stream] Uploading binary to GUID: ${guid}`);

  const fileStream = fs.createReadStream(filePath);
  const uploadRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'video/mp4' },
    body: fileStream,
    // Required by Node.js when streaming large files via fetch
    duplex: 'half'
  } as any);

  if (!uploadRes.ok) throw new Error('Failed to upload video data to Bunny Stream');

  return `https://${BUNNY_CDN}/${guid}/playlist.m3u8`;
}

async function uploadToBunnyStorage(slug: string, filePath: string) {
  console.log(`[Bunny Storage] Uploading cover asset for: ${slug}`);
  const thumbnailPath = `thumbnails/${slug}-${Date.now()}.jpg`;

  const fileStream = fs.createReadStream(filePath);
  // Using the verified Singapore regional server hostname
  const uploadRes = await fetch(`https://sg.storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`, {
    method: 'PUT',
    headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': 'image/jpeg' },
    body: fileStream,
    // Required by Node.js when streaming large files via fetch
    duplex: 'half'
  } as any);

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Bunny Storage API Error (${uploadRes.status}): ${errorText}`);
  }

  return `https://${STORAGE_PULLZONE}/${thumbnailPath}`;
}


// ------------------------------------------------------------------
// MAIN PROCESSING ENGINE
// ------------------------------------------------------------------
async function processVideoUrl(targetUrl: string) {
  console.log(`\n=========================================`);
  console.log(`[Extraction] Querying target media: ${targetUrl}`);

  try {
    const metadata = await ytDlp(targetUrl, { dumpJson: true, noWarnings: true });

    const title = metadata.title || 'Untitled Scene';

    // 🔥 FIX: Safe duration parsing to prevent NaN:NaN errors
    const durationRaw = metadata.duration || 0;
    const mins = Math.floor(durationRaw / 60) || 0;
    const secs = Math.floor(durationRaw % 60) || 0;
    const duration = durationRaw > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : "0:00";

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tags = metadata.tags || [];

    const videoPath = path.join(TEMP_DIR, `${slug}.mp4`);
    const thumbPath = path.join(TEMP_DIR, `${slug}.jpg`);

    console.log(`[Download] Starting engine. You should see a progress bar below...`);

    // 🔥 THE OVERKILL UPGRADE: Hand the download off to aria2c
    const ytDlpProcess = (ytDlp as any).exec(targetUrl, {
      output: videoPath,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      writeThumbnail: true,

      // 1. Tell yt-dlp to use aria2c as the engine
      downloader: 'aria2c',

      // 2. Pass IDM-level thread configuration:
      downloaderArgs: 'aria2c:-x 16 -s 16 -k 1M',

      addHeader: [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
    } as any);

    // 🔥 THE MISSING PIECES: Show the live progress bar, and WAIT for the download to finish!
    if (ytDlpProcess.stdout) ytDlpProcess.stdout.pipe(process.stdout);
    if (ytDlpProcess.stderr) ytDlpProcess.stderr.pipe(process.stderr);
    await ytDlpProcess;

    // Now it safely moves on to check the thumbnail and upload...
    const finalThumbPath = fs.existsSync(thumbPath) ? thumbPath : videoPath.replace('.mp4', '.jpg');

    const videoUrl = await uploadToBunnyStream(title, videoPath);
    const thumbnailUrl = await uploadToBunnyStorage(slug, finalThumbPath);

    console.log(`[Database] Instantiating Prisma engine payload for: ${slug}`);
    await prisma.video.create({
      data: {
        title,
        slug,
        videoUrl,
        thumbnail: thumbnailUrl,
        duration,
        tags,
        views: Math.floor(Math.random() * 5000) + 1000,
      }
    });

    console.log(`[Success] Pipeline execution fully finished for: ${title}`);

    // Housekeeping
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(finalThumbPath)) fs.unlinkSync(finalThumbPath);

  } catch (error) {
    console.error(`[FATAL ERROR] System execution aborted for target ${targetUrl}:`, error);
  }
}

// ------------------------------------------------------------------
// PIPELINE RUN ROUTINE
// ------------------------------------------------------------------
async function run() {
  const urlsFilePath = path.join(__dirname, 'urls.txt');

  if (!fs.existsSync(urlsFilePath)) {
    console.error(`[Error] Target database parsing file (urls.txt) missing from runtime context.`);
    process.exit(1);
  }

  const urlsToScrape = fs.readFileSync(urlsFilePath, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`[Loader] Loaded ${urlsToScrape.length} target records from urls.txt storage resource.`);

  for (const url of urlsToScrape) {
    await processVideoUrl(url);
    // 3 second cooling down offset window to respect target traffic limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n[Finished] Total execution queue completely processed.');
  await prisma.$disconnect();
}

run();