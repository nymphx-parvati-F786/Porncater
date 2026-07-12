import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_CATEGORY_URL = 'https://www.whoreshub.com/models/luna-star/';
const OUTPUT_FILE = path.join(__dirname, 'urls.txt');

// The URL pattern or selector that identifies a direct video link
const URL_MATCH_PATTERN = '/videos/';

async function harvest() {
    console.log(`[Harvester] Launching headless browser...`);
    const browser = await chromium.launch({ headless: true });

    // 1. Create a browser context and set the User-Agent globally here
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // 2. Generate the page directly out of the custom context
    const page = await context.newPage();

    try {
        console.log(`[Harvester] Navigating to: ${TARGET_CATEGORY_URL}`);
        await page.goto(TARGET_CATEGORY_URL, { waitUntil: 'networkidle' });

        console.log(`[Harvester] Scrolling page to trigger lazy-loaded items...`);
        // Scroll down progressively to ensure thumbnails and links render
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(1000);
        }

        console.log(`[Harvester] Extracting anchor links...`);
        // Gather all href attributes from the page
        const hrefs = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(a => a.href).filter(Boolean);
        });

        // Filter links to keep only unique direct video URLs
        const videoUrls = Array.from(new Set(hrefs)).filter(url => url.includes(URL_MATCH_PATTERN));

        // Display the links in real-time to your terminal window
        console.log(`\n--- [LAUNCHING PARSED LINKS VIA CONSOLE] ---`);
        videoUrls.forEach((url, index) => {
            console.log(`[${index + 1}] Target link found: ${url}`);
        });
        console.log(`-------------------------------------------\n`);

        console.log(`[Harvester] Found ${videoUrls.length} valid video links.`);

        if (videoUrls.length > 0) {
            // Append or write to the text file
            fs.writeFileSync(OUTPUT_FILE, videoUrls.join('\n'), 'utf-8');
            console.log(`[Success] Saved links directly to: ${OUTPUT_FILE}`);
        } else {
            console.log(`[Warning] No links matched the pattern "${URL_MATCH_PATTERN}". Check your selector or pattern.`);
        }

    } catch (error) {
        console.error(`[Error] Sourcing failed:`, error);
    } finally {
        // This will cleanly close the browser instances along with all contexts and pages
        await browser.close();
    }
}

harvest();