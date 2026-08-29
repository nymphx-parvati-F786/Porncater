import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// NATIVE PIPELINE AUTO-LOGGER
// ------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, 'script_logs/migration_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFilePath = path.join(LOG_DIR, `migration-run-${timestamp}.txt`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// @ts-ignore
process.stdout.write = function (chunk, encoding, callback) {
  logStream.write(chunk.toString().replace(/\r/g, ''));
  return originalStdoutWrite(chunk, encoding, callback);
};

// @ts-ignore
process.stderr.write = function (chunk, encoding, callback) {
  logStream.write(chunk);
  return originalStderrWrite(chunk, encoding, callback);
};

console.log(`=========================================`);
console.log(`🚀 STARTING BUNNY STREAM 3TB MIGRATION (MAX QUALITY)`);
console.log(`📁 Auto-logging all output to: ${logFilePath}`);
console.log(`=========================================\n`);

// ------------------------------------------------------------------
// INIT
// ------------------------------------------------------------------
const prisma = new PrismaClient();

// Target old CDN to only fetch un-migrated videos
const OLD_BUNNY_CDN = process.env.BUNNY_CDN as string; 

// New Non-Replicated Library Keys
const NEW_BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID_2 as string;
const NEW_BUNNY_API_KEY = process.env.BUNNY_API_KEY_2 as string;
const NEW_BUNNY_CDN = process.env.BUNNY_CDN_2 as string;
const NEW_COLLECTION_ID = process.env.STREAM_GENERAL_FULL_SCENES_COLLECTION_ID_2 as string;

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type ProcessResult = 'CLEAN_SUCCESS' | 'RETRY_SUCCESS' | 'FAILED';

async function migrateVideo(video: any, maxRetries = 2): Promise<ProcessResult> {
  console.log(`\n=========================================`);
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`[Migration] Processing: "${video.title}" (Attempt ${attempt}/${maxRetries})`);
      
      const urlParts = video.videoUrl.split('/');
      const oldVideoId = urlParts[urlParts.length - 2]; 

      // STEP 1: CREATE THE EMPTY VIDEO IN THE EXACT COLLECTION
      console.log(`[Bunny API] Creating empty entry...`);
      const createRes = await fetch(`https://video.bunnycdn.com/library/${NEW_BUNNY_LIBRARY_ID}/videos`, {
        method: 'POST',
        headers: { 
          'AccessKey': NEW_BUNNY_API_KEY, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          title: video.title, 
          collectionId: NEW_COLLECTION_ID 
        })
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create video entry: ${await createRes.text()}`);
      }

      const { guid: newVideoId } = await createRes.json();
      console.log(`[Bunny API] Created new GUID inside collection: ${newVideoId}`);

      // STEP 2: ZERO-COMPROMISE QUALITY WATERFALL
      // We try the absolute best quality first. If it 404s, we step down seamlessly.
      const qualities = ['original', '1080p', '720p', '480p', '360p', '240p'];
      let fetchSuccess = false;

      for (const quality of qualities) {
        const sourceMp4Url = `https://${OLD_BUNNY_CDN}/${oldVideoId}/play_${quality}.mp4`;
        console.log(`[Bunny API] Searching for quality: ${quality}...`);

        const fetchRes = await fetch(`https://video.bunnycdn.com/library/${NEW_BUNNY_LIBRARY_ID}/videos/${newVideoId}/fetch`, {
          method: 'POST',
          headers: {
            'AccessKey': NEW_BUNNY_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url: sourceMp4Url })
        });

        if (fetchRes.ok) {
          fetchSuccess = true;
          console.log(`[Bunny API] ✅ BOOM! Successfully initiated fetch for ${quality} file!`);
          break; // Stop looking, we found the highest available quality
        } else {
          console.log(`[Bunny API] ⏭️ ${quality} not found. Checking next tier...`);
        }
      }

      // If ALL qualities fail, something is deeply wrong with the source video
      if (!fetchSuccess) {
        throw new Error(`All resolutions returned 404. The source video is completely missing from the old library.`);
      }

      // STEP 3: UPDATE PRISMA SUPABASE TABLE
      const newVideoUrl = `https://${NEW_BUNNY_CDN}/${newVideoId}/playlist.m3u8`;

      console.log(`[Database] Updating Supabase record to: ${newVideoUrl}`);
      await prisma.video.update({
        where: { id: video.id },
        data: { videoUrl: newVideoUrl }
      });

      console.log(`[Success] Video successfully migrated!`);
      return attempt === 1 ? 'CLEAN_SUCCESS' : 'RETRY_SUCCESS';

    } catch (error: any) {
      console.error(`[ERROR] Attempt ${attempt} failed:`, error.message || error);
      attempt++;

      if (attempt <= maxRetries) {
        console.log(`[Cooling] Pausing for 3 seconds before trying again...\n`);
        await sleep(3000);
      }
    }
  }

  console.error(`[FATAL ERROR] All attempts exhausted for ID ${video.id}. Abandoning.`);
  return 'FAILED';
}

// ------------------------------------------------------------------
// PIPELINE RUN ROUTINE
// ------------------------------------------------------------------
async function run() {
  console.log(`🔍 Scanning database for videos hosted on old CDN: ${OLD_BUNNY_CDN}...`);
  
  // Catch videos whether they use your custom domain OR the raw vz-xxx b-cdn.net URL
  const videos = await prisma.video.findMany({
    where: { 
      OR: [
        { videoUrl: { contains: OLD_BUNNY_CDN } },
        { videoUrl: { contains: 'vz-d5b5a220-935.b-cdn.net' } },
        { videoUrl: { contains: 'b-cdn.net' } }
      ]
    },
    select: { id: true, title: true, videoUrl: true }
  });

  console.log(`[Loader] Found ${videos.length} videos targeting the old library.\n`);

  let cleanSucceeded = 0;
  let retrySucceeded = 0;
  const failedVideoIds: number[] = [];

  for (const video of videos) {
    const status = await migrateVideo(video);
    if (status === 'CLEAN_SUCCESS') cleanSucceeded++;
    else if (status === 'RETRY_SUCCESS') retrySucceeded++;
    else if (status === 'FAILED') failedVideoIds.push(video.id);

    // Wait 1.5 seconds so we don't trip Bunny's API rate limits
    await sleep(1500); 
  }

  console.log(`\n=========================================`);
  console.log(`🚀 [MIGRATION PIPELINE COMPLETE]`);
  console.log(`=========================================`);
  console.log(`Succeeded (Clean) : ${cleanSucceeded}`);
  console.log(`Succeeded (Retry) : ${retrySucceeded}`);
  console.log(`Total Failed      : ${failedVideoIds.length}`);
  console.log(`=========================================\n`);

  if (failedVideoIds.length > 0) {
    const failedFilePath = path.join(__dirname, 'script_logs', 'migration_failed_ids.txt');
    if (!fs.existsSync(path.dirname(failedFilePath))) fs.mkdirSync(path.dirname(failedFilePath), { recursive: true });
    fs.writeFileSync(failedFilePath, failedVideoIds.join('\n'), 'utf-8');
    console.log(`📝 Failed IDs saved to: ${failedFilePath}`);
  }

  await prisma.$disconnect();
}

run();