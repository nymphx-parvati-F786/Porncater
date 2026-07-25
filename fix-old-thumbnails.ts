import sharp from 'sharp';
import fs from 'fs';
import path from 'fs/promises';

// Script logic: 
// 1. Fetch images from your /public/thumbnails or local temp directory.
// 2. Resize to width: 480, format: webp, quality: 45.
// 3. Overwrite or re-upload to Bunny Storage.

async function optimizeLocalThumbnails(dirPath: string) {
  const files = await path.readdir(dirPath);

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp')) {
      const filePath = `${dirPath}/${file}`;
      const tempPath = `${dirPath}/temp_${file.split('.')[0]}.webp`;

      await sharp(filePath)
        .resize(480, 270, { fit: 'cover' })
        .webp({ quality: 45 })
        .toFile(tempPath);

      console.log(`Optimized: ${file}`);
    }
  }
}