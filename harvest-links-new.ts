// 🔥 The Magic Imports
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply the stealth plugin to hide the "headless" footprint
chromium.use(stealth());

// Configuration
const TARGET_CATEGORY_URL = 'https://www.whoreshub.com/models/luna-star/';
const OUTPUT_FILE = path.join(__dirname, 'urls.txt');
const URL_MATCH_PATTERN = '/videos/'; 

async function harvest() {
    console.log(`[Harvester] Launching stealth browser...`);
    
    // Launch using the stealth-wrapped chromium
    const browser = await chromium.launch({ 
        headless: true, // Should work now, but change to false if they are ultra-strict
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled' // Extra layer of bot-hiding
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        // Add natural language headers so you don't look like a blank robot
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
    });

    const page = await context.newPage();

    try {
        console.log(`[Harvester] Navigating to: ${TARGET_CATEGORY_URL}`);
        
        await page.goto(TARGET_CATEGORY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log(`[Harvester] Scrolling page to trigger lazy-loaded items...`);
        
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            // Slight randomization in the wait time to look more human
            const waitTime = Math.floor(Math.random() * 1000) + 1000; 
            await page.waitForTimeout(waitTime); 
        }

        console.log(`[Harvester] Extracting anchor links...`);
        
        const hrefs = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(a => a.href).filter(Boolean);
        });

        const videoUrls = Array.from(new Set(hrefs)).filter((url: string) => url.includes(URL_MATCH_PATTERN));

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