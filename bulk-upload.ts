import { PrismaClient } from '@prisma/client';
import ytDlp from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { getVideoDurationInSeconds } from 'get-video-duration';
// @ts-ignore
import ffprobe from 'ffprobe-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// NATIVE PIPELINE AUTO-LOGGER (Now with Spam Filter)
// ------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, 'pipeline_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFilePath = path.join(LOG_DIR, `pipeline-run-${timestamp}.txt`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// @ts-ignore
process.stdout.write = function (chunk, encoding, callback) {
  const text = chunk.toString();
  
  // 🔥 THE SPAM FILTER: Identifies aria2c live progress bars and empty line-clearing junk
  const isAriaProgressBar = /\[#[a-f0-9]{6}\s.*?\]/i.test(text);
  const isAriaSpacer = text.includes('\r') && text.trim() === ''; 
  
  if (!isAriaProgressBar && !isAriaSpacer) {
    // Strip raw carriage returns so the text file formatting stays perfectly clean
    logStream.write(text.replace(/\r/g, ''));
  }
  
  // ALWAYS push everything to the real console so you get the live animation on screen
  return originalStdoutWrite(chunk, encoding, callback);
};

// @ts-ignore
process.stderr.write = function (chunk, encoding, callback) {
  logStream.write(chunk);
  return originalStderrWrite(chunk, encoding, callback);
};

console.log(`=========================================`);
console.log(`🚀 STARTING HARVESTER PIPELINE`);
console.log(`📁 Auto-logging all output to: ${logFilePath}`);
console.log(`=========================================\n`);

// ------------------------------------------------------------------
// INIT
// ------------------------------------------------------------------
const prisma = new PrismaClient();

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

const TEMP_DIR = path.join(__dirname, 'local_videos_to_upload');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

type ProcessResult = 'CLEAN_SUCCESS' | 'RETRY_SUCCESS' | 'FAILED';

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
    duplex: 'half'
  } as any);

  if (!uploadRes.ok) throw new Error('Failed to upload video data to Bunny Stream');
  return `https://${BUNNY_CDN}/${guid}/playlist.m3u8`;
}

async function uploadToBunnyStorage(slug: string, filePath: string) {
  console.log(`[Bunny Storage] Uploading cover asset for: ${slug}`);
  const thumbnailPath = `thumbnails/${slug}-${Date.now()}.jpg`;

  const fileStream = fs.createReadStream(filePath);
  const uploadRes = await fetch(`https://sg.storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`, {
    method: 'PUT',
    headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': 'image/jpeg' },
    body: fileStream,
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
async function processVideoUrl(targetUrl: string, maxRetries = 2): Promise<ProcessResult> {
  console.log(`\n=========================================`);
  
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`[Extraction] Querying target media: ${targetUrl} (Attempt ${attempt}/${maxRetries})`);
      
      const metadata = await ytDlp(targetUrl, {
        dumpJson: true,
        noWarnings: true,
        addHeader: 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const title = metadata.title || 'Untitled Scene';
      const durationRaw = metadata.duration || 0;
      const mins = Math.floor(durationRaw / 60) || 0;
      const secs = Math.floor(durationRaw % 60) || 0;
      const duration = durationRaw > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : "0:00";

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tags = metadata.tags || [];

      const videoPath = path.join(TEMP_DIR, `${slug}.mp4`);
      const thumbPath = path.join(TEMP_DIR, `${slug}.jpg`);

      console.log(`[Download] Starting engine. Waiting for aria2c to finish...`);

      const ytDlpProcess = (ytDlp as any).exec(targetUrl, {
        output: videoPath,
        format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        writeThumbnail: true,
        downloader: 'aria2c',
        downloaderArgs: 'aria2c:-x 16 -s 16 -k 1M',
        addHeader: [
          'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
      } as any);

      if (ytDlpProcess.stdout) ytDlpProcess.stdout.pipe(process.stdout);
      if (ytDlpProcess.stderr) ytDlpProcess.stderr.pipe(process.stderr);
      await ytDlpProcess;

      console.log(`[Duration] Inspecting local .mp4 file to calculate exact length...`);
      let finalDuration = duration;
      try {
        const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
        const m = Math.floor(durationInSeconds / 60);
        const s = Math.floor(durationInSeconds % 60);
        finalDuration = `${m}:${s.toString().padStart(2, '0')}`;
        console.log(`[Duration] Successfully calculated: ${finalDuration}`);
      } catch (err) {
        console.log(`[Duration Warning] Could not parse local file duration, using fallback.`);
      }

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
          duration: finalDuration,
          tags,
          views: Math.floor(Math.random() * 5000) + 1000,
        }
      });

      console.log(`[Success] Pipeline execution fully finished for: ${title}`);

      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(finalThumbPath)) fs.unlinkSync(finalThumbPath);

      return attempt === 1 ? 'CLEAN_SUCCESS' : 'RETRY_SUCCESS';

    } catch (error: any) {
      console.error(`\n[ERROR] Attempt ${attempt} failed:`, error.message || error);
      attempt++;
      
      if (attempt <= maxRetries) {
        console.log(`[Cooling] Pausing for 4 seconds before trying again...\n`);
        await new Promise(res => setTimeout(res, 4000));
      }
    }
  }

  console.error(`[FATAL ERROR] All ${maxRetries} attempts exhausted. Abandoning URL.`);
  return 'FAILED';
}

// ------------------------------------------------------------------
// PIPELINE RUN ROUTINE
// ------------------------------------------------------------------
async function run() {
  const urlsFilePath = path.join(__dirname, 'urls.txt');
  const failedFilePath = path.join(__dirname, 'failed_urls.txt');

  if (!fs.existsSync(urlsFilePath)) {
    console.error(`[Error] Target database parsing file (urls.txt) missing from runtime context.`);
    process.exit(1);
  }

  const urlsToScrape = fs.readFileSync(urlsFilePath, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`[Loader] Loaded ${urlsToScrape.length} target records from urls.txt storage resource.`);

  let cleanSucceeded = 0;
  let retrySucceeded = 0;
  let failedUrls: string[] = [];

  for (const url of urlsToScrape) {
    const status = await processVideoUrl(url);
    
    if (status === 'CLEAN_SUCCESS') cleanSucceeded++;
    else if (status === 'RETRY_SUCCESS') retrySucceeded++;
    else if (status === 'FAILED') failedUrls.push(url);

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n=========================================`);
  console.log(`🚀 [PIPELINE EXECUTION COMPLETE]`);
  console.log(`=========================================`);
  console.log(`Total Target URLs : ${urlsToScrape.length}`);
  console.log(`Succeeded (Clean) : ${cleanSucceeded}`);
  console.log(`Succeeded (Retry) : ${retrySucceeded}`);
  console.log(`Total Failed      : ${failedUrls.length}`);
  console.log(`=========================================\n`);

  if (failedUrls.length > 0) {
    fs.writeFileSync(failedFilePath, failedUrls.join('\n'), 'utf-8');
    console.log(`[Log] Dumped ${failedUrls.length} failed URLs into: ${failedFilePath}`);
  }

  await prisma.$disconnect();
}

run();