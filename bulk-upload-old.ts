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
        // @ts-ignore
        body: fileStream
    });

    if (!uploadRes.ok) throw new Error('Failed to upload video data to Bunny Stream');

    return `https://${BUNNY_CDN}/${guid}/playlist.m3u8`;
}

async function uploadToBunnyStorage(slug: string, filePath: string) {
    console.log(`[Bunny Storage] Uploading cover asset for: ${slug}`);
    const thumbnailPath = `thumbnails/${slug}-${Date.now()}.jpg`;

    const fileStream = fs.createReadStream(filePath);
    const uploadRes = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${thumbnailPath}`, {
        method: 'PUT',
        headers: { AccessKey: STORAGE_API_KEY, 'Content-Type': 'image/jpeg' },
        // @ts-ignore
        body: fileStream
    });

    if (!uploadRes.ok) throw new Error('Failed to upload thumbnail to Storage');

    return `https://${STORAGE_PULLZONE}/${thumbnailPath}`;
}

// ------------------------------------------------------------------
// MAIN PROCESSING ENGINE
// ------------------------------------------------------------------
async function processVideoUrl(targetUrl: string) {
    console.log(`\n=========================================`);
    console.log(`[Extraction] Querying target media: ${targetUrl}`);

    try {
        // We create a base config to disguise the script as a normal Chrome browser
        const baseYtDlpConfig = {
            // Use yt-dlp's native spoofing switch instead of manual headers
            impersonate: 'chrome',
            cookies: path.join(__dirname, 'cookies.txt'),
            // Force the downloader to drop or auto-manage referers to the video server
            referer: 'default',
        };

        // Pass the disguise headers to the metadata extraction
        const metadata = await ytDlp(targetUrl, {
            dumpJson: true,
            noWarnings: true,
            ...baseYtDlpConfig
        } as any);

        const title = metadata.title || 'Untitled Scene';
        const durationRaw = metadata.duration || 0;
        const duration = `${Math.floor(durationRaw / 60)}:${Math.floor(durationRaw % 60).toString().padStart(2, '0')}`;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const tags = metadata.tags || [];

        const videoPath = path.join(TEMP_DIR, `${slug}.mp4`);
        const thumbPath = path.join(TEMP_DIR, `${slug}.jpg`);

        console.log(`[Download] Running yt-dlp binary allocation operations...`);

        // Pass the disguise headers to the actual download operation
        await ytDlp(targetUrl, {
            output: videoPath,
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            writeThumbnail: true,
            convertThumbnails: 'jpg',
            ...baseYtDlpConfig
        } as any);

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

        // Housekeeping routines to systematically protect disk resource limits
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