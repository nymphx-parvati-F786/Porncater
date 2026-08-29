import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// 🔥 EXPANDED PORNSTAR MASTER LIST (current + classic + high-volume)
// ~280 unique names — should cover 90%+ of mainstream tube content
const EXTRA_KNOWN_STARS = [
  // === CURRENT TOP / HIGH SEARCH VOLUME (2023-2026) ===
  "Alex Adams", "Angela White", "Violet Myers", "Bonnie Blue", "Lana Rhoades", "Lana Rhodes",
  "Lily Phillips", "Abella Danger", "Eva Elfie", "Riley Reid", "Mia Khalifa", "Emily Willis",
  "Martina Smeraldi", "Jessica Sodi", "Salome Gil", "Blake Blossom", "Savannah Bond",
  "Rae Lil Black", "Lexi Lore", "Coco Lovelock", "Alina Angel", "Mariana Martix",
  "Sara Blonde", "Giselle Montes", "Elle Brooke", "Sky Bri", "Josephine Jackson",
  "Melody Marks", "Elle Lee", "Cherry Candle", "Marina Gold", "Esperanza Gomez",
  "Gabbie Carter", "Kenna James", "Vanna Bardot", "Scarlit Scandal", "Vina Sky",
  "Autumn Falls", "Payton Preslee", "Reagan Foxx", "Casca Akashova", "Kali Roses",
  "Gia Derza", "Jane Wilde", "Adria Rae", "Skylar Vox", "Siri Dahl", "Liya Silver",
  "Kira Noir", "Aaliyah Hadid", "Janice Griffith", "Kenzie Reeves", "Chloe Amour",
  "Cubbi Thompson", "Scarlett Sage", "Jennifer White", "Codi Vore", "Valentina Nappi",
  "Bridgette B", "Kendra Sunderland", "Lena Paul", "Nicole Aniston", "Madison Ivy",
  "Mia Malkova", "Dani Daniels", "Alexis Texas", "Kendra Lust", "Brandi Love",
  "Cory Chase", "Cherie DeVille", "Romi Rain", "Ava Addams", "Lisa Ann", "Julia Ann",
  "Kissa Sins", "Phoenix Marie", "Anissa Kate", "Tori Black", "Remy LaCroix",
  "Asa Akira", "Kayden Kross", "Jayden Jaymes", "Bree Olson", "Gianna Michaels",
  "Rachel Starr", "Dillion Harper", "Piper Perri", "August Ames", "Jordi El Niño Polla",
  "Johnny Sins", "Manuel Ferrara", "Keiran Lee", "Danny D", "Mick Blue", "Rocco Siffredi",
  "Jason Luv", "Xander Corvus", "Small Hands", "Dredd", "Maximo Garcia", "Jax Slayher",
  "Ricky Johnson", "Isiah Maxwell", "Lexington Steele", "Chris Strokes", "Nacho Vidal",

  // === STRONG MID-TIER / HIGH SCENE COUNT ===
  "Adriana Chechik", "Gina Valentina", "Britney Amber", "Lela Star", "Danika Mori",
  "Reislin", "Luxury Girl", "Sweetie Fox", "Candy Love", "NoLube", "Scott Stark",
  "Gattouz0", "Comatozze", "Jak Knife", "Emma Rose", "Eva Maxim", "Ariel Demure",
  "Tyler Wu", "Malik Delgaty", "Rhyheim Shabazz", "Sandro Jenner", "Cade Maddox",
  "Elisa Sanches", "Littleangel84", "Sara Diamante", "Antonio Mallorca", "Sara Jay",
  "Maitland Ward", "Lauren Phillips", "Mercedes Carrera", "Penny Pax", "Nadia Ali",
  "Renee Gracie", "Mana Sakura", "Hitomi Tanaka", "Anri Okita", "Julia Kyoka",
  "Yua Mikami", "Aoi Sora", "Maria Ozawa", "Sola Aoi", "Akiho Yoshizawa",
  "Teanna Trump", "Chanell Heart", "Misty Stone", "Ana Foxxx", "September Reign",
  "Julie Kay", "Ebony Mystique", "Jenna Foxx", "Lotus Lain", "Chanell Heart",
  "Abigail Mac", "Alina Lopez", "Eliza Ibarra", "Emma Hix", "Gia Paige",
  "Karlee Grey", "Lena The Plug", "Leolulu", "Little Caprice", "Marley Brinx",
  "Naomi Woods", "Nina North", "Quinn Wilde", "Sloan Harper", "Uma Jolie",
  "Veronica Rodriguez", "Whitney Wright", "Zoe Bloom", "Aria Lee", "Bailey Brooke",
  "Blair Williams", "Bunny Colby", "Carmen Caliente", "Daisy Stone", "Elena Koshka",
  "Elle Voneva", "Evelyn Claire", "Faye Reagan", "Gina Gerson", "Haley Reed",
  "Hannah Hays", "Ivy Jones", "Jade Kush", "Jessa Rhodes", "Jill Kassidy",
  "Jojo Kiss", "Kasey Warner", "Kimber Woods", "Kristen Scott", "Lana Sharapova",
  "Lily Larimar", "Liz Jordan", "Maya Bijou", "Molly Jane", "Natalie Knight",
  "Nia Nacci", "Nina Elle", "Olivia Austin", "Pamela Morrison", "Paris White",
  "Penny Barber", "Raven Hart", "Sara Luvv", "Serena Santos", "Sofie Reyez",
  "Stella Cox", "Sydney Cole", "Tara Ashley", "Tiffany Tatum", "Tori Cummings",
  "Valeria Blue", "Victoria June", "Winter Jade", "Zoe Sparx",

  // === CLASSICS / HIGH LEGACY VOLUME ===
  "Jenna Jameson", "Sasha Grey", "Nina Hartley", "Stormy Daniels", "Tera Patrick",
  "Jesse Jane", "Jenna Haze", "Belladonna", "Stoya", "Bobbi Starr", "Katsuni",
  "Sunny Leone", "Priya Rai", "Shyla Stylez", "Eva Angelina", "Nikki Benz",
  "Jenna Presley", "Carmella Bing", "Audrey Bitoni", "Briana Banks", "Nina Mercedez",
  "Aletta Ocean", "Puma Swede", "Tory Lane", "Silvia Saint", "Angelina Valentine",
  "Devon", "Lexi Belle", "Janine Lindemulder", "Tanya James", "Abbey Brooks",
  "Jenaveve Jolie", "Carmel Moore", "Ava Lauren", "Mariah Milano", "Cody Lane",
  "Diamond Kitty", "Julia Bond", "Crissy Moran", "Gemma Massey", "Lisa Sparxxx",
  "Ron Jeremy", "Peter North", "Sean Michaels", "Billy Glide", "Tom Byron",
  "Randy Spears", "Evan Stone", "Mr. Marcus", "Prince Yahshua", "T.T. Boy",
  "Jack Napier", "Wesley Pipes", "Mark Davis", "Steve Holmes", "Nacho Vidal",
  "Rocco Siffredi", "Rocco Reed", "Erik Everhard", "James Deen", "Manuel Ferrara",
  "Mick Blue", "Keiran Lee", "Johnny Sins", "Danny Mountain", "Chris Diamond",
  "Tony De Sergio", "Logan Pierce", "Joshua Broome", "Dean Van Damme",

  // === MILF / MATURE HIGH VOLUME ===
  "Brandi Love", "Cory Chase", "Cherie DeVille", "Julia Ann", "Lisa Ann",
  "Kendra Lust", "Nina Elle", "Reagan Foxx", "Syren De Mer", "India Summer",
  "Veronica Avluv", "Alena Croft", "Ariella Ferrera", "Brianna Beach", "Dee Williams",
  "Diamond Foxxx", "Eva Notty", "Holly Heart", "Karen Fisher", "Katie Morgan",
  "Kelly Madison", "Krissy Lynn", "Leilani Lei", "Lolly Dames", "Mandy Bright",
  "Momoka Nishina", "Rachel Steele", "Richelle Ryan", "Sara Jay", "Shay Fox",
  "Sofie Marie", "Tanya Tate", "Vanessa Cage", "Yasmin Scott",

  // === EXTRA HIGH-FREQUENCY NAMES THAT OFTEN APPEAR IN TITLES ===
  "Anny Walker", "Apolonia Lapiedra", "Clea Gaultier", "Cléa Gaultier", "Ginebra Bellucci",
  "Julia De Lucia", "Katrina Moreno", "Lina Mercury", "Marilyn Sugar", "May Thai",
  "Nancy A", "Nesty", "Nicole Love", "Sasha Rose", "Tina Kay", "Veronica Leal",
  "Zaawaadi", "Zazie Skymm", "Alyssa Reece", "Angel Emily", "Angel Wicky",
  "Anissa Kate", "Anna Polina", "Cassie Del Isla", "Cherry Kiss", "Claire Castel",
  "Clea Gaultier", "Emylia Argan", "Erika Bellucci", "Hannah Vivienne", "Jada Sparks",
  "Jia Lissa", "Kate Rich", "Lana Roy", "Liya Silver", "Luna Rival", "Marilyn Crystal",
  "Nancy Ace", "Nesty", "Nicole Pearl", "Rebecca Volpetti", "Sasha Colibri",
  "Sata Jones", "Sienna Day", "Sophie Sparks", "Tiffany Tatum", "Venera Maxima"
];

async function runRetroactiveMapping() {
  console.log("🔥 Booting up the Ultimate Tube Scanner...");

  // 0. RESET POSTGRES ID SEQUENCES (Fixes P2002 ID collisions)
  console.log("🔄 Synchronizing PostgreSQL auto-increment sequences...");
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Pornstar"', 'id'), COALESCE((SELECT MAX(id) FROM "Pornstar"), 1));`
    );
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Video"', 'id'), COALESCE((SELECT MAX(id) FROM "Video"), 1));`
    );
    console.log("✅ PostgreSQL ID sequences synchronized successfully.\n");
  } catch (seqErr: any) {
    console.warn("⚠️ Sequence sync warning (can be safely ignored if on SQLite):", seqErr.message);
  }

  // 1. Read CSV profiles
  const csvFilePath = path.resolve(process.cwd(), 'Pornstar_rows.csv');
  const rawNames: string[] = [];

  if (fs.existsSync(csvFilePath)) {
    console.log("📂 Reading Pornstar_rows.csv...");
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.name) rawNames.push(data.name.trim());
        })
        .on('end', resolve)
        .on('error', reject);
    });
    console.log(`✅ Loaded ${rawNames.length} names from Pornstar_rows.csv.`);
  } else {
    console.log("⚠️ Pornstar_rows.csv not found. Relying solely on EXTRA_KNOWN_STARS.");
  }

  // Combine and deduplicate names BY SLUG upfront
  const masterRosterMap = new Map<string, string>(); // slug -> displayName
  for (const name of [...rawNames, ...EXTRA_KNOWN_STARS]) {
    if (!name) continue;
    const slug = generateSlug(name);
    if (slug && !masterRosterMap.has(slug)) {
      masterRosterMap.set(slug, name.trim());
    }
  }

  console.log(`🧠 Master Pool: Searching titles against ${masterRosterMap.size} unique performer slugs.\n`);

  // 2. Find videos currently missing pornstars
  const videosToFix = await prisma.video.findMany({
    where: { pornstars: { none: {} } },
    select: { id: true, title: true }
  });

  console.log(`🔍 Found ${videosToFix.length} videos with zero pornstars connected. Scanning titles...`);

  let fixCount = 0;
  let failCount = 0;

  for (const video of videosToFix) {
    // Map of unique matched slug -> performer name for THIS video
    const matchedStars = new Map<string, string>();

    // 3. Exact Word Boundary Regex Match
    for (const [slug, starName] of masterRosterMap.entries()) {
      const escapedStar = starName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedStar}\\b`, 'i');

      if (regex.test(video.title)) {
        matchedStars.set(slug, starName);
      }
    }

    if (matchedStars.size > 0) {
      // 4. Build unique connectOrCreate payload
      const pornstarConnections = Array.from(matchedStars.entries()).map(([slug, name]) => ({
        where: { slug },
        create: { name, slug, avatarUrl: null }
      }));

      try {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            pornstars: {
              connectOrCreate: pornstarConnections
            }
          }
        });

        console.log(`✅ Video ID ${video.id}: "${video.title}" -> Tagged: [${Array.from(matchedStars.values()).join(', ')}]`);
        fixCount++;
      } catch (err: any) {
        console.error(`❌ Error updating Video ID ${video.id}: ${err.message}`);
        failCount++;
      }
    }
  }

  console.log(`\n🎉 DONE! Successfully mapped performers to ${fixCount} videos. (Errors: ${failCount})`);
}

runRetroactiveMapping()
  .catch(console.error)
  .finally(() => prisma.$disconnect());