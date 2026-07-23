import { PrismaClient } from '@prisma/client';
import ytDlp from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { getVideoDurationInSeconds } from 'get-video-duration';
import csv from 'csv-parser';

// @ts-ignore
import ffprobe from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
// @ts-ignore
import ffmpegStatic from 'ffmpeg-static';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
} else {
  throw new Error('Could not find the ffmpeg binary for this system.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// NATIVE PIPELINE AUTO-LOGGER
// ------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, 'script_logs/pipeline_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFilePath = path.join(LOG_DIR, `pipeline-run-${timestamp}.txt`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// @ts-ignore
process.stdout.write = function (chunk, encoding, callback) {
  const text = chunk.toString();
  const isAriaProgressBar = /\[#[a-f0-9]{6}\s.*?\]/i.test(text);
  const isAriaSpacer = text.includes('\r') && text.trim() === '';

  if (!isAriaProgressBar && !isAriaSpacer) {
    logStream.write(text.replace(/\r/g, ''));
  }
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
const STREAM_GENERAL_FULL_SCENES_COLLECTION_ID = process.env.STREAM_GENERAL_FULL_SCENES_COLLECTION_ID as string;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_CDN = process.env.BUNNY_CDN as string;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

const TEMP_DIR = path.join(__dirname, 'local_videos_to_upload');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

type ProcessResult = 'CLEAN_SUCCESS' | 'RETRY_SUCCESS' | 'FAILED';

// 🔥 BACKUP STAR LIST (Add as many as you want)
const EXTRA_KNOWN_STARS = [
  "Mia Khalifa", "Riley Reid", "Lana Rhoades", "Sasha Grey", "Nicole Aniston",
  "Cory Chase", "Brandi Love", "Dani Daniels", "Alexis Texas", "Kendra Lust",
  "Madison Ivy", "August Ames", "Mia Malkova", "Jordi El Niño Polla", "Johnny Sins",
  "Lena Paul", "Gia Derza", "Eva Elfie", "Emily Willis", "Angela White",
  "Romi Rain", "Ava Addams", "Lisa Ann", "Julia Ann", "Kissa Sins", "Jane Wilde",
  "Abella Danger", "Adriana Chechik", "Blake Blossom", "Cherie DeVille"
];

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
const generateSlug = (text: string) => {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function uploadToBunnyStream(title: string, filePath: string) {
  console.log(`[Bunny Stream] Creating entry for: ${title}`);
  const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, collectionId: STREAM_GENERAL_FULL_SCENES_COLLECTION_ID })
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
  const thumbnailPath = `thumbnails/${slug}-${Date.now()}.webp`;

  const fileStream = fs.createReadStream(filePath);
  const uploadRes = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`, {
    method: 'PUT',
    headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': 'image/webp' },
    body: fileStream,
    duplex: 'half'
  } as any);

  if (!uploadRes.ok) throw new Error(`Bunny Storage API Error (${uploadRes.status})`);
  return `https://${STORAGE_PULLZONE}/${thumbnailPath}`;
}

// ------------------------------------------------------------------
// MAIN PROCESSING ENGINE
// ------------------------------------------------------------------
async function processVideoUrl(targetUrl: string, masterRosterMap: Map<string, string>, maxRetries = 2): Promise<ProcessResult> {
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
      const duration = formatDuration(durationRaw);

      const slug = generateSlug(title);
      const tags: string[] = metadata.tags || [];
      const category = tags.length > 0 ? tags[0] : null;

      const videoPath = path.join(TEMP_DIR, `${slug}.mp4`);
      const thumbPath = path.join(TEMP_DIR, `${slug}.webp`);

      console.log(`[Download] Starting engine. Waiting for aria2c to finish...`);

      const ytDlpProcess = (ytDlp as any).exec(targetUrl, {
        output: videoPath,
        format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        writeThumbnail: true,
        downloader: 'aria2c',
        downloaderArgs: 'aria2c:-x 16 -s 16 -k 1M',
        addHeader: ['User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'],
      } as any);

      if (ytDlpProcess.stdout) ytDlpProcess.stdout.pipe(process.stdout);
      if (ytDlpProcess.stderr) ytDlpProcess.stderr.pipe(process.stderr);
      await ytDlpProcess;

      console.log(`[Duration] Inspecting local .mp4 file to calculate exact length...`);
      let finalDuration = duration;
      let thumbnailTimestamp = ['00:00:15'];

      try {
        const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
        finalDuration = formatDuration(durationInSeconds);

        const thumbDuration = durationInSeconds * 0.35;
        const thb_h = Math.floor(thumbDuration / 3600);
        const thb_m = Math.floor((thumbDuration % 3600) / 60);
        const thb_s = Math.floor(thumbDuration % 60);

        thumbnailTimestamp = [`${thb_h.toString().padStart(2, '0')}:${thb_m.toString().padStart(2, '0')}:${thb_s.toString().padStart(2, '0')}`];
      } catch (err) {
        console.log(`[Duration Warning] Could not parse local file duration, using fallback.`);
      }

      let finalThumbPath = fs.existsSync(thumbPath) ? thumbPath : videoPath.replace('.mp4', '.webp');

      if (!fs.existsSync(finalThumbPath)) {
        console.log(`[Thumbnail Engine] Source image missing. Extracting high-res frame...`);
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .on('end', () => resolve(true))
            .on('error', (err) => reject(err))
            .screenshots({
              timestamps: thumbnailTimestamp,
              filename: path.basename(finalThumbPath),
              folder: TEMP_DIR,
              size: '1280x720'
            });
        });
      }

      // 🔥 CONCURRENT UPLOADING: Double the speed!
      console.log(`[CDN] Initiating dual-upload to Bunny Stream & Storage...`);
      const [videoUrl, thumbnailUrl] = await Promise.all([
        uploadToBunnyStream(title, videoPath),
        uploadToBunnyStorage(slug, finalThumbPath)
      ]);

      // 🔥 SMART PORNSTAR MAPPER
      const matchedStars = new Map<string, string>();
      const searchableText = `${title} ${tags.join(" ")}`.toLowerCase();

      for (const [starSlug, starName] of masterRosterMap.entries()) {
        const escapedStar = starName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedStar}\\b`, 'i');
        if (regex.test(searchableText)) {
          matchedStars.set(starSlug, starName);
        }
      }

      const pornstarConnections = Array.from(matchedStars.entries()).map(([pSlug, pName]) => ({
        where: { slug: pSlug },
        create: { name: pName, slug: pSlug, avatarUrl: null }
      }));

      console.log(`[Database] Upserting video and ${pornstarConnections.length} pornstar stubs...`);
      
      // 🔥 UPSERT: Prevents crashes if you restart the script on the same URL
      await prisma.video.upsert({
        where: { slug },
        update: {
          videoUrl,
          thumbnail: thumbnailUrl,
          pornstars: { connectOrCreate: pornstarConnections }
        },
        create: {
          title,
          slug,
          videoUrl,
          thumbnail: thumbnailUrl,
          duration: finalDuration,
          category,
          tags,
          status: "PUBLISHED",
          views: Math.floor(Math.random() * 5000) + 1000,
          pornstars: { connectOrCreate: pornstarConnections }
        }
      });

      console.log(`[Success] Pipeline finished for: ${title}`);

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

  console.error(`[FATAL ERROR] All attempts exhausted. Abandoning URL.`);
  return 'FAILED';
}

// ------------------------------------------------------------------
// PIPELINE RUN ROUTINE
// ------------------------------------------------------------------
async function run() {
  console.log("🔄 Synchronizing PostgreSQL auto-increment sequences...");
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Pornstar"', 'id'), COALESCE((SELECT MAX(id) FROM "Pornstar"), 1));`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Video"', 'id'), COALESCE((SELECT MAX(id) FROM "Video"), 1));`);
  } catch (e) {}

  // 1. Build the Master Roster
  const csvFilePath = path.join(process.cwd(), 'Pornstar_rows.csv');
  const rawNames: string[] = [];

  if (fs.existsSync(csvFilePath)) {
    console.log("📂 Reading Pornstar_rows.csv...");
    await new Promise((resolve) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => { if (data.name) rawNames.push(data.name.trim()); })
        .on('end', resolve);
    });
  }

  const masterRosterMap = new Map<string, string>();
  for (const name of [...rawNames, ...EXTRA_KNOWN_STARS]) {
    if (!name) continue;
    const slug = generateSlug(name);
    if (slug && !masterRosterMap.has(slug)) masterRosterMap.set(slug, name.trim());
  }
  console.log(`🧠 Master Roster loaded with ${masterRosterMap.size} performers.`);

  // 2. Read Targets
  const urlsFilePath = path.join(__dirname, 'urls.txt');
  const failedFilePath = path.join(__dirname, 'failed_urls.txt');

  if (!fs.existsSync(urlsFilePath)) {
    console.error(`[Error] urls.txt missing.`);
    process.exit(1);
  }

  const urlsToScrape = fs.readFileSync(urlsFilePath, 'utf-8').split('\n').map(u => u.trim()).filter(u => u.length > 0);
  console.log(`[Loader] Loaded ${urlsToScrape.length} target records.\n`);

  let cleanSucceeded = 0;
  let retrySucceeded = 0;
  let failedUrls: string[] = [];

  // 3. Process Sequence
  for (const url of urlsToScrape) {
    const status = await processVideoUrl(url, masterRosterMap);
    if (status === 'CLEAN_SUCCESS') cleanSucceeded++;
    else if (status === 'RETRY_SUCCESS') retrySucceeded++;
    else if (status === 'FAILED') failedUrls.push(url);

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n=========================================`);
  console.log(`🚀 [PIPELINE EXECUTION COMPLETE]`);
  console.log(`=========================================`);
  console.log(`Succeeded (Clean) : ${cleanSucceeded}`);
  console.log(`Succeeded (Retry) : ${retrySucceeded}`);
  console.log(`Total Failed      : ${failedUrls.length}`);
  console.log(`=========================================\n`);

  if (failedUrls.length > 0) {
    fs.writeFileSync(failedFilePath, failedUrls.join('\n'), 'utf-8');
  }

  await prisma.$disconnect();
}

run();