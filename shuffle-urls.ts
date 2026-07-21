import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, 'urls.txt');

// The ultimate shuffling algorithm
function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomizeFeed() {
    console.log(`\n======================================================`);
    console.log(`[Mixer] Preparing to shuffle your URL feed...`);
    console.log(`======================================================`);

    if (!fs.existsSync(OUTPUT_FILE)) {
        console.error(`[Error] Could not find ${OUTPUT_FILE}. Run your harvester first!`);
        return;
    }

    // Read the file and clean up any empty lines
    let urls = fs.readFileSync(OUTPUT_FILE, 'utf-8')
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);

    const originalCount = urls.length;

    if (originalCount === 0) {
        console.log(`[Warning] urls.txt is empty. Nothing to shuffle.`);
        return;
    }

    // Bonus: Remove any accidental duplicate links
    urls = Array.from(new Set(urls));
    const uniqueCount = urls.length;
    const dupesRemoved = originalCount - uniqueCount;

    console.log(`[Mixer] Loaded ${originalCount} total links.`);
    if (dupesRemoved > 0) {
        console.log(`[Mixer] Cleaned up ${dupesRemoved} duplicate URLs.`);
    }

    // Shuffle the array like a deck of cards
    console.log(`[Mixer] Shuffling the remaining ${uniqueCount} links into a completely random order...`);
    urls = shuffleArray(urls);

    // Overwrite urls.txt with the new randomized list
    // (Here we actually WANT to overwrite, not append, so the whole list is replaced by the shuffled version)
    fs.writeFileSync(OUTPUT_FILE, urls.join('\n') + '\n', 'utf-8');

    console.log(`[Success] Feed perfectly randomized! Check urls.txt to see the new mix.\n`);
}

randomizeFeed();