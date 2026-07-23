import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// NATIVE PIPELINE AUTO-LOGGER
// ------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, 'script_logs/banner_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');
const logFilePath = path.join(LOG_DIR, `banner-run-${timestamp}.txt`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// @ts-ignore
process.stdout.write = function (chunk, encoding, callback) {
  const text = chunk.toString();
  logStream.write(text.replace(/\r/g, ''));
  return originalStdoutWrite(chunk, encoding, callback);
};

// @ts-ignore
process.stderr.write = function (chunk, encoding, callback) {
  logStream.write(chunk);
  return originalStderrWrite(chunk, encoding, callback);
};

console.log(`=========================================`);
console.log(`🚀 STARTING BANNER UPLOADER PIPELINE`);
console.log(`📁 Auto-logging output to: ${logFilePath}`);
console.log(`=========================================\n`);

// ------------------------------------------------------------------
// CONFIG & ENVIRONMENT
// ------------------------------------------------------------------
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE as string;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY as string;
const STORAGE_PULLZONE = process.env.BUNNY_PULLZONE as string; // e.g. img-s1-cdn.porncater.com

const BANNERS_DIR = path.join(__dirname, 'banners');
const TARGET_FOLDER = 'media/creative_bnr/b970x70'; // Destination path in Bunny Storage

if (!fs.existsSync(BANNERS_DIR)) {
  fs.mkdirSync(BANNERS_DIR, { recursive: true });
}

type ProcessResult = 'CLEAN_SUCCESS' | 'RETRY_SUCCESS' | 'FAILED';

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
function generateCleanBannerName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  let base = path.basename(originalName, ext).toLowerCase();

  // Strip common prefix garbage (e.g. "blk-970x70") -> "b970x70"
  base = base.replace('blk-970x70', 'b970x70');

  // Remove non-alphanumeric chars, substitute hyphens, trim trailing/leading dashes
  base = base.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // 6-character random hex hash
  const shortHash = crypto.randomBytes(3).toString('hex');

  return `${base}-${shortHash}${ext}`;
}

async function uploadToBunnyStorage(localFilePath: string, cleanFileName: string): Promise<string> {
  const destinationPath = `${TARGET_FOLDER}/${cleanFileName}`;
  console.log(`[Bunny Storage] Uploading banner to: ${destinationPath}`);

  // Read the file as a Buffer (TypeScript natively accepts Buffer as BodyInit)
  const fileBuffer = fs.readFileSync(localFilePath);

  const uploadRes = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${destinationPath}`, {
    method: 'PUT',
    headers: {
      AccessKey: STORAGE_API_KEY,
      'Content-Type': 'application/octet-stream'
    },
    body: fileBuffer
  });

  if (!uploadRes.ok) {
    throw new Error(`Bunny Storage API Error (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  return `https://${STORAGE_PULLZONE}/${destinationPath}`;
}

// ------------------------------------------------------------------
// SINGLE BANNER PROCESSING ENGINE
// ------------------------------------------------------------------
async function processBannerFile(filePath: string, maxRetries = 2): Promise<{ status: ProcessResult; url?: string }> {
  const originalFileName = path.basename(filePath);
  const cleanFileName = generateCleanBannerName(originalFileName);

  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`\n[Banner Engine] Processing: ${originalFileName} (Attempt ${attempt}/${maxRetries})`);
      console.log(`[Nomenclature] Cleaned filename: ${cleanFileName}`);

      const publicUrl = await uploadToBunnyStorage(filePath, cleanFileName);

      console.log(`[Success] Asset live at: ${publicUrl}`);

      // Clean up local source file after successful upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        status: attempt === 1 ? 'CLEAN_SUCCESS' : 'RETRY_SUCCESS',
        url: publicUrl
      };

    } catch (error: any) {
      console.error(`[ERROR] Attempt ${attempt} failed for ${originalFileName}:`, error.message || error);
      attempt++;

      if (attempt <= maxRetries) {
        console.log(`[Cooling] Waiting 2 seconds before retrying...\n`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }

  console.error(`[FATAL ERROR] All upload attempts failed for: ${originalFileName}`);
  return { status: 'FAILED' };
}

// ------------------------------------------------------------------
// MAIN RUN ROUTINE
// ------------------------------------------------------------------
async function run() {
  const files = fs.readdirSync(BANNERS_DIR);
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const targetFiles = files.filter(file => validExtensions.includes(path.extname(file).toLowerCase()));

  if (targetFiles.length === 0) {
    console.log(`\n⚠️ No banner images found in: ${BANNERS_DIR}`);
    console.log(`👉 Place your raw .jpg / .png / .webp banner files in that folder and re-run.`);
    return;
  }

  console.log(`\n[Loader] Found ${targetFiles.length} banner(s) queued for upload.\n`);

  let cleanSucceeded = 0;
  let retrySucceeded = 0;
  let failedFiles: string[] = [];
  const uploadedUrls: string[] = [];

  for (const fileName of targetFiles) {
    const filePath = path.join(BANNERS_DIR, fileName);
    const { status, url } = await processBannerFile(filePath);

    if (status === 'CLEAN_SUCCESS') {
      cleanSucceeded++;
      if (url) uploadedUrls.push(url);
    } else if (status === 'RETRY_SUCCESS') {
      retrySucceeded++;
      if (url) uploadedUrls.push(url);
    } else {
      failedFiles.push(fileName);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n=========================================`);
  console.log(`🚀 [BANNER PIPELINE EXECUTION COMPLETE]`);
  console.log(`=========================================`);
  console.log(`Succeeded (Clean) : ${cleanSucceeded}`);
  console.log(`Succeeded (Retry) : ${retrySucceeded}`);
  console.log(`Total Failed      : ${failedFiles.length}`);
  console.log(`=========================================\n`);

  if (uploadedUrls.length > 0) {
    console.log(`📋 Generated Public CDN URLs:`);
    uploadedUrls.forEach(url => console.log(` - ${url}`));
    console.log(`\n`);
  }

  if (failedFiles.length > 0) {
    const failedFilePath = path.join(__dirname, 'failed_banners.txt');
    fs.writeFileSync(failedFilePath, failedFiles.join('\n'), 'utf-8');
    console.log(`⚠️ Failed items logged to: ${failedFilePath}`);
  }
}

run();