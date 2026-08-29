import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import sharp from "sharp";

sharp.cache(false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// 🎛️ YOUR CONTROL CENTER
// ------------------------------------------------------------------
// 0.1 = Intro shots (Clothed)
// 0.5 = Middle of the scene (Action)
// 0.75 = Climax of the scene (Highly explicit / Cumshots)
const HOT_ZONE_PERCENTAGE = 0.75; 

// ------------------------------------------------------------------
// AUTO-LOGGER
// ------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, 'script_logs/avatar_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFilePath = path.join(LOG_DIR, `avatar-sync-${timestamp}.txt`);
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
console.log(`🚀 STARTING DEEP-DIVE AVATAR HARVESTER`);
console.log(`🎯 Targeting images at the ${HOT_ZONE_PERCENTAGE * 100}% mark of galleries`);
console.log(`=========================================\n`);

// ------------------------------------------------------------------
// INIT
// ------------------------------------------------------------------
const prisma = new PrismaClient();

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string;

const TEMP_DIR = path.join(__dirname, 'local_avatars_to_upload');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAvatarSync() {
  const targets = await prisma.pornstar.findMany({
    where: {
      OR: [
        { avatarUrl: null },
        { avatarUrl: "" },
      ],
    },
  });

  console.log(`[Loader] Found ${targets.length} performers missing avatars.\n`);

  for (const star of targets) {
    try {
      console.log(`-----------------------------------------`);
      console.log(`[Processing] ${star.name}`);

      // 1. Scrape PornPics Profile to find the first GALLERY
      const profileUrl = `https://www.pornpics.com/pornstars/${star.slug}/`;
      const { data: profileHtml } = await axios.get(profileUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });

      const $profile = cheerio.load(profileHtml);
      
      // Find the first link that goes to a gallery
      let galleryHref = $profile('a[href*="/galleries/"]').first().attr('href');
      
      if (!galleryHref) {
        console.log(`[Warning] No galleries found on profile for ${star.name}. Skipping.`);
        continue;
      }

      // Ensure the URL is absolute
      if (galleryHref.startsWith('/')) {
        galleryHref = `https://www.pornpics.com${galleryHref}`;
      }

      console.log(`[Deep Dive] Entering Gallery: ${galleryHref}`);

      // 2. Scrape the Gallery Page
      const { data: galleryHtml } = await axios.get(galleryHref, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });

      const $gallery = cheerio.load(galleryHtml);
      
      // Get all images in the gallery
      const imageLinks = $gallery("li.thumbwook a.rel-link");
      const totalImages = imageLinks.length;

      if (totalImages === 0) {
        console.log(`[Warning] Gallery is empty. Skipping.`);
        continue;
      }

      // 3. Calculate the "Hot Zone" Index
      const targetIndex = Math.floor(totalImages * HOT_ZONE_PERCENTAGE);
      const selectedLink = imageLinks.eq(targetIndex);
      
      let imageUrl = selectedLink.attr("href");
      if (!imageUrl) {
         const imgTag = selectedLink.find("img");
         imageUrl = imgTag.attr("data-src") || imgTag.attr("src");
      }

      if (!imageUrl) {
        console.log(`[Warning] Could not extract image URL at index ${targetIndex}.`);
        continue;
      }

      console.log(`[Target Locked] Grabbed image ${targetIndex + 1} of ${totalImages}`);
      console.log(`[Extraction] Source: ${imageUrl}`);

      // 4. Download Image
      const { data: imageBuffer } = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": galleryHref // Bypass hotlink protection
        }
      });

      const safeSlug = star.slug.replace(/-/g, '_');

      // 5. Save to Temp & Optimize with Sharp
      const rawPath = path.join(TEMP_DIR, `${safeSlug}_raw.jpg`);
      const optimizedPath = path.join(TEMP_DIR, `${safeSlug}_thumbnl.webp`);
      
      fs.writeFileSync(rawPath, imageBuffer);
      
      console.log(`[Sharp Engine] Cropping and compressing avatar...`);
      await sharp(rawPath)
        .resize({
          width: 400,
          height: 400,
          fit: 'cover',
          position: 'top', 
        })
        .webp({ quality: 85, effort: 6 })
        .toFile(optimizedPath);

      // 6. Upload to Bunny Storage
      const uniqueInt = Math.floor(Math.random() * 90) + 10; 
      const filename = `${safeSlug}_thumbnl_${uniqueInt}.webp`;
      const bunnyPath = `models/${filename}`; 
      
      console.log(`[Bunny Storage] Uploading to /models/...`);
      const fileBuffer = fs.readFileSync(optimizedPath);

      const uploadRes = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${bunnyPath}`, {
        method: 'PUT',
        headers: {
          AccessKey: STORAGE_API_KEY,
          'Content-Type': 'image/webp',
        },
        body: fileBuffer,
      });

      if (!uploadRes.ok) {
        throw new Error(`Bunny Storage API Error (${uploadRes.status})`);
      }

      // 7. Update Database
      const finalCdnUrl = `https://${STORAGE_PULLZONE}/${bunnyPath}`;
      await prisma.pornstar.update({
        where: { id: star.id },
        data: { avatarUrl: finalCdnUrl },
      });

      console.log(`[Success] ${star.name} updated with action shot!`);
      console.log(`[Live URL] ${finalCdnUrl}`);

      // Cleanup Temp Files
      try {
        if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
        if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
      } catch (cleanupError: any) {
        console.log(`[Cleanup Warning] Ignored file lock on temp file`);
      }

      // Respectful Delay to avoid IP ban
      await delay(3000);

    } catch (error: any) {
      console.error(`[ERROR] Failed to process ${star.name}: ${error.response?.status === 404 ? "Profile Not Found (404)" : error.message}`);
    }
  }

  console.log(`\n=========================================`);
  console.log(`🚀 [AVATAR HARVEST COMPLETE]`);
  console.log(`=========================================\n`);
}

runAvatarSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());