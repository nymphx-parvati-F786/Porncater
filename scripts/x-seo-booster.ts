import { PrismaClient } from '@prisma/client';
import { TwitterApi } from 'twitter-api-v2';
import sharp from 'sharp';
import 'dotenv/config';

// ------------------------------------------------------------------
// INIT
// ------------------------------------------------------------------
const prisma = new PrismaClient();

const twitterClient = new TwitterApi({
  appKey: process.env.ConsumerKey || "",
  appSecret: process.env.ConsumerKeySecret || "",
  accessToken: process.env.AccessToken || "",
  accessSecret: process.env.AccessTokenSecret || "",
});

console.log(`\n=========================================`);
console.log(`🚀 STARTING X (TWITTER) SEO BOOSTER BOT`);
console.log(`=========================================\n`);

// ------------------------------------------------------------------
// ENGINE
// ------------------------------------------------------------------
async function postToX() {
  try {
    console.log(`[Database] Hunting for a high-converting scene...`);

    // 1. Grab a random published video with tags and performers
    const count = await prisma.video.count({ where: { status: 'PUBLISHED' } });
    if (count === 0) throw new Error("No published videos found.");

    const skip = Math.floor(Math.random() * count);
    const video = await prisma.video.findFirst({
      where: { status: 'PUBLISHED' },
      skip,
      include: { pornstars: { select: { name: true } } }
    });

    if (!video) throw new Error("Database failed to return video.");

    console.log(`[Target Acquired] ${video.title}`);

    // 2. Fetch the WebP thumbnail from BunnyCDN
    console.log(`[CDN] Downloading optimized thumbnail...`);
    const mediaResponse = await fetch(video.thumbnail);
    if (!mediaResponse.ok) throw new Error(`CDN Error: ${mediaResponse.status}`);
    
    const arrayBuffer = await mediaResponse.arrayBuffer();
    const webpBuffer = Buffer.from(arrayBuffer);

    // 3. Convert WebP to JPEG on the fly (X API rejects WebP)
    console.log(`[Transcoder] Converting WebP -> JPEG for X compliance...`);
    const jpegBuffer = await sharp(webpBuffer).jpeg({ quality: 92 }).toBuffer();

    // 4. Upload to X
    console.log(`[X API] Uploading media payload...`);
    const mediaId = await twitterClient.v1.uploadMedia(jpegBuffer, { mimeType: 'image/jpeg' });

    // 5. Construct the Hyper-Addict Copy
    // Extract performers and tags to generate dynamic hashtags
    const starTags = video.pornstars.map(s => `#${s.name.replace(/\s+/g, '')}`).join(" ");
    const categoryTags = (video.tags || []).slice(0, 3).map((t: string) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(" ");
    const hashtags = `${starTags} ${categoryTags} #NSFWX`.trim();

    // The Hook (No Link - protects algorithmic reach)
    const hookText = `Watch exclusive video of ${video.title} ❤️💦💦\n\n🔥 Watch Full Scene in the replies ⬇️\n\n${hashtags}`;

    // The Trap (The Link)
    const videoUrl = `https://www.porncater.com/video/${video.id}/${video.slug}`;
    const trapText = `🔗 Watch More below ⬇️\n${videoUrl}`;

    // 6. Deploy the payload
    console.log(`[X API] Deploying Hook tweet...`);
    const rwClient = twitterClient.readWrite;
    const hookTweet = await rwClient.v2.tweet(hookText, {
      media: { media_ids: [mediaId] },
    });

    console.log(`[X API] Deploying Trap reply with backlink...`);
    await rwClient.v2.reply(trapText, hookTweet.data.id);

    console.log(`[SUCCESS] Traffic engine deployed successfully!`);
    console.log(`Tweet ID: ${hookTweet.data.id}\n`);

  } catch (error: any) {
    console.error(`[FATAL ERROR] Pipeline failed:`, error.message || error);
  }
}

// ------------------------------------------------------------------
// AUTOMATION LOOP
// ------------------------------------------------------------------
async function runAutoPilot() {
  // Fire immediately on startup
  await postToX();

  // Then fire every 4 hours (14400000 milliseconds)
  const INTERVAL_MS = 4 * 60 * 60 * 1000;
  console.log(`[Standby] Bot entering sleep mode. Next post in 4 hours...\n`);
  
  setInterval(async () => {
    await postToX();
    console.log(`[Standby] Bot entering sleep mode. Next post in 4 hours...\n`);
  }, INTERVAL_MS);
}

runAutoPilot();