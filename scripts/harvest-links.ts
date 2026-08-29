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
const TARGETS_FILE = path.join(__dirname, 'targets.txt');
const OUTPUT_FILE = path.join(__dirname, 'urls.txt');
const URL_MATCH_PATTERN = '/videos/';

// 🔥 Your custom absolute log directory
const LOG_DIR = 'script_logs/harvester_logs'; // Change this to your desired log directory
const LOG_FILE = path.join(LOG_DIR, 'harvest_log.txt');

// Bulletproof check: Create the folder structure if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom Logger: Prints to PowerShell AND saves to your D: drive with a timestamp
function logAction(message: string) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] ${message}`;

    // Print to PowerShell
    console.log(message);

    // Append to your custom log file
    fs.appendFileSync(LOG_FILE, logMessage + '\n', 'utf-8');
}

async function harvest() {
    logAction(`\n======================================================`);
    logAction(`[SYSTEM] Starting new harvest session...`);
    logAction(`[SYSTEM] Logging to: ${LOG_FILE}`);
    logAction(`======================================================`);

    if (!fs.existsSync(TARGETS_FILE)) {
        logAction(`[Error] Could not find ${TARGETS_FILE}. Please create it and add your target links.`);
        return;
    }

    const targetUrls = fs.readFileSync(TARGETS_FILE, 'utf-8')
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);

    if (targetUrls.length === 0) {
        logAction(`[Warning] ${TARGETS_FILE} is empty. Add some links to it!`);
        return;
    }

    logAction(`[Harvester] Found ${targetUrls.length} targets to scrape. Launching stealth browser...`);

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
    });

    for (let i = 0; i < targetUrls.length; i++) {
        const currentTarget = targetUrls[i];
        logAction(`\n--- [Processing ${i + 1}/${targetUrls.length}] ---`);
        logAction(`Target: ${currentTarget}`);

        const page = await context.newPage();

        try {
            await page.goto(currentTarget, { waitUntil: 'domcontentloaded', timeout: 60000 });

            logAction(`[Harvester] Scrolling page to trigger lazy-loaded items...`);
            for (let j = 0; j < 5; j++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                const waitTime = Math.floor(Math.random() * 1000) + 1000;
                await page.waitForTimeout(waitTime);
            }

            logAction(`[Harvester] Extracting anchor links...`);
            const hrefs = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors.map(a => a.href).filter(Boolean);
            });

            const videoUrls = Array.from(new Set(hrefs)).filter((url: string) => url.includes(URL_MATCH_PATTERN));

            logAction(`[Harvester] Found ${videoUrls.length} valid video links on this page.`);

            if (videoUrls.length > 0) {
                // 1. Append links to urls.txt (The main file for processing)
                fs.appendFileSync(OUTPUT_FILE, videoUrls.join('\n') + '\n', 'utf-8');

                // 2. Write the specific links into your D: drive audit log
                logAction(`[Audit] Links extracted from ${currentTarget}:`);
                videoUrls.forEach(url => {
                    logAction(`  -> ${url}`);
                });

                logAction(`[Success] Appended ${videoUrls.length} links to ${OUTPUT_FILE}`);
            } else {
                logAction(`[Warning] No links matched the pattern "${URL_MATCH_PATTERN}" on this page.`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logAction(`[Error] Failed scraping ${currentTarget}: ${errorMessage}`);
        } finally {
            await page.close();
        }
    }

    logAction(`\n[Harvester] All targets processed! Shutting down browser.`);
    await browser.close();
}

harvest();