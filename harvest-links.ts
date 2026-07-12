import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_CATEGORY_URL = 'https://spankbang.com/s/sunny+leone/';
const OUTPUT_FILE = path.join(__dirname, 'urls.txt');
const URL_MATCH_PATTERN = 'sunny+leone'; // Adjusted for WhoresHub

async function harvest() {
    console.log(`[Harvester] Launching browser...`);
    
    // Keeping it headless for speed, but you can set to false if you want to watch
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        console.log(`[Harvester] Navigating to: ${TARGET_CATEGORY_URL}`);
        
        // Wait for the HTML structure to load, not the endless background trackers
        await page.goto(TARGET_CATEGORY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log(`[Harvester] Scrolling page to trigger lazy-loaded items...`);
        
        // Scroll down progressively to ensure thumbnails and links render
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(1500); // Wait a bit for lazy-loaded content
        }

        console.log(`[Harvester] Extracting anchor links...`);
        
        // Gather all href attributes from the page
        const hrefs = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(a => a.href).filter(Boolean);
        });

        // Filter links to keep only unique direct video URLs
        const videoUrls = Array.from(new Set(hrefs)).filter(url => url.includes(URL_MATCH_PATTERN));

        console.log(`\n--- [LAUNCHING PARSED LINKS VIA CONSOLE] ---`);
        videoUrls.forEach((url, index) => {
            console.log(`[${index + 1}] Target link found: ${url}`);
        });
        console.log(`-------------------------------------------\n`);

        console.log(`[Harvester] Found ${videoUrls.length} valid video links.`);

        if (videoUrls.length > 0) {
            fs.writeFileSync(OUTPUT_FILE, videoUrls.join('\n'), 'utf-8');
            console.log(`[Success] Saved links directly to: ${OUTPUT_FILE}`);
        } else {
            console.log(`[Warning] No links matched the pattern "${URL_MATCH_PATTERN}". Check your selector or pattern.`);
        }

    } catch (error) {
        console.error(`[Error] Sourcing failed:`, error);
    } finally {
        await browser.close();
    }
}

harvest();