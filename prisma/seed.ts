// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding Pornstars...");

//   // 1. Seed Pornstars with New Schema Fields
//   const pornstars = [
//     {
//       id: 1,
//       name: "Sunny Leone",
//       slug: "sunny-leone",
//       avatarUrl: "/thumbnails/pornstars/sunny.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png", // Wide cover fallback
//       bio: "Popular Indian-Canadian adult actress",
//       views: 18200000,
//       subscribers: 1250000,
//       tags: ["Desi", "MILF", "Brunette"],
//     },
//     {
//       id: 2,
//       name: "Emily Willis",
//       slug: "emily-willis",
//       avatarUrl: "/thumbnails/pornstars/emilywillis_thmbnl_0002.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Famous American adult film actress known for intense scenes",
//       views: 14700000,
//       subscribers: 980000,
//       tags: ["Petite", "Hardcore", "Anal"],
//     },
//     {
//       id: 3,
//       name: "Lana Rhoades",
//       slug: "lana-rhoades",
//       avatarUrl: "/thumbnails/pornstars/lanarhoades_thmbnl_0005.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Stunning American adult actress",
//       views: 22400000,
//       subscribers: 2100000,
//       tags: ["Brunette", "Big Ass"],
//     },
//     {
//       id: 4,
//       name: "Katana Kombat",
//       slug: "katana-kombat",
//       avatarUrl: "/thumbnails/pornstars/katanakombat_thmbnl_0007.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Hot Latina adult star",
//       views: 8900000,
//       subscribers: 450000,
//       tags: ["Latina", "Wife", "Hardcore"],
//     },
//     {
//       id: 5,
//       name: "Luna Star",
//       slug: "luna-star",
//       avatarUrl: "/thumbnails/pornstars/lunastar_thmbnl_0006.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Cuban-American adult film actress",
//       views: 11200000,
//       subscribers: 670000,
//       tags: ["Latina", "Big Tits"],
//     },
//     {
//       id: 6,
//       name: "Mia Malkova",
//       slug: "mia-malkova",
//       avatarUrl: "/thumbnails/pornstars/miamalkova_thmbnl_0009.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Popular American adult actress",
//       views: 19800000,
//       subscribers: 1800000,
//       tags: ["Blonde", "Athletic"],
//     },
//     {
//       id: 7,
//       name: "Savannah Bond",
//       slug: "savannah-bond",
//       avatarUrl: "/thumbnails/pornstars/savannahbond_thmbnl_0004.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Australian adult film star",
//       views: 7500000,
//       subscribers: 320000,
//       tags: ["MILF", "Blonde"],
//     },
//     {
//       id: 8,
//       name: "Blake Blossom",
//       slug: "blake-blossom",
//       avatarUrl: "/thumbnails/pornstars/blakeblossom_thmbnl_0008.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Busty American adult actress",
//       views: 9300000,
//       subscribers: 510000,
//       tags: ["Big Tits", "Brunette"],
//     },
//     {
//       id: 9,
//       name: "Jennifer White",
//       slug: "jennifer-white",
//       avatarUrl: "/thumbnails/pornstars/jenniferwhite_thmbnl_0003.jpg",
//       coverImage:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       bio: "Experienced MILF adult actress",
//       views: 15400000,
//       subscribers: 890000,
//       tags: ["MILF", "Cuckold", "Blonde"],
//     },
//   ];

//   for (const pornstar of pornstars) {
//     await prisma.pornstar.upsert({
//       where: { id: pornstar.id },
//       update: pornstar,
//       create: pornstar,
//     });
//   }
//   console.log(`✅ Seeded ${pornstars.length} pornstars`);

//   // ======================
//   // 2. Seed Videos (Smart Mapping)
//   // ======================
//   console.log("🌱 Seeding Porn Videos...");

//   const videos = [
//     {
//       title: "MILF Jennifer White Cuckold Hubby To Fuck BBC",
//       slug: "jennifer-white-cuckold-bbc",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/3802ca15-30e8-40dd-9d30-8758946af0fd/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000001.png",
//       duration: "32:13",
//       views: 245000,
//       category: "MILF",
//       pornstarId: 9,
//     },
//     {
//       title: "Ass Masterpiece With Lana (Lana Rhoades)",
//       slug: "lana-rhoades-ass-masterpiece",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/73a8f374-0a2d-401f-b2a2-44c2d882cc02/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000002.png",
//       duration: "1:11:49",
//       views: 189000,
//       category: "Anal",
//       pornstarId: 3,
//     },
//     {
//       title: "The Dutiful Wife (Katana Kombat) - Real Wife Stories",
//       slug: "katana-kombat-dutiful-wife",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/26a17dac-7888-49f2-9110-518e11356393/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000003.png",
//       duration: "45:00",
//       views: 312000,
//       category: "Wife",
//       pornstarId: 4,
//     },
//     {
//       title: "How Much Hindu Girls Love Muslim Circumcised Cocks",
//       slug: "hindu-girls-muslim-cocks",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/2eb28b31-7e35-4fec-a91e-307af77505ac/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000004.png",
//       duration: "11:24",
//       views: 98000,
//       category: "Desi",
//       pornstarId: null,
//     },
//     {
//       title: "Emily Willis BBC Double Penetration",
//       slug: "emily-willis-bbc-double-penetration",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/793b3529-f1ad-4dfc-bd76-235b0d7899a3/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000005.png",
//       duration: "45:08",
//       views: 24000,
//       category: "Interracial",
//       pornstarId: 2,
//     },
//     {
//       title: "Luna Star - Anal First date",
//       slug: "luna-star-anal-first-date",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/7d196552-7b6d-44cd-9f86-30b6433947c9/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
//       duration: "31:50",
//       views: 53000,
//       category: "Anal",
//       pornstarId: 5,
//     },
//     {
//       title: "Sunny Leone - Purple Pleasure",
//       slug: "sunny-leone-purple-pleasure",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/b33dc70b-ab26-458d-b402-f4da8c0699b2/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000007.png",
//       duration: "07:51",
//       views: 112000,
//       category: "Desi",
//       pornstarId: 1,
//     },
//     {
//       title:
//         "Mia Malkova, Riley Reid, Lena The Plug & Salomelons Garage Masturbation",
//       slug: "mia-malkova-garage-masturbation",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/63166b0a-9c15-4e33-ad47-cb7fd174f860/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000008.png",
//       duration: "08:46",
//       views: 228000,
//       category: "Masturbation",
//       pornstarId: 6,
//     },
//     {
//       title: "Sunny Leone - Fucked hard on hot Red Sofa",
//       slug: "sunny-leone-red-sofa",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/32b522e1-8959-4c48-babe-d2be4fcfaccb/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000009.png",
//       duration: "15:09",
//       views: 78000,
//       category: "Desi",
//       pornstarId: 1,
//     },
//     {
//       title: "Fuck The Architect (Savannah Bond)",
//       slug: "savannah-bond-fuck-architect",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/530f5eda-fbfb-4c60-8d7e-3bd324d0ccd8/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000010.png",
//       duration: "40:44",
//       views: 58000,
//       category: "Hardcore",
//       pornstarId: 7,
//     },
//     {
//       title: "Blake Blossom fucked hard by BBC in her Mansion",
//       slug: "blake-blossom-bbc-mansion",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/5c096eb7-7c63-4f9a-8748-44ef3bdf3fe6/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000011.png",
//       duration: "37:37",
//       views: 128000,
//       category: "Interracial",
//       pornstarId: 8,
//     },
//     {
//       title: "She Loves taking BBC in her Ass - Emily Willis",
//       slug: "emily-willis-bbc-anal",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/125aff86-d1fb-46ad-8e9e-c74d344ef6fe/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000012.png",
//       duration: "45:06",
//       views: 337000,
//       category: "Anal",
//       pornstarId: 2,
//     },
//     {
//       title: "Valentina Nappi Big ass - fucked by Mandingo BBC",
//       slug: "valentina-nappi-big-ass-fucked-by-mandingo-bbc",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/ccaeeb81-f686-4b8d-8497-7d453990801d/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/valentina-nappi-big-ass-fucked-by-mandingo-bbc-1780394294347.jpg",
//       duration: "32:45",
//       views: 45000,
//       category: "Interracial",
//       pornstarId: null,
//     },
//     {
//       title: "Abella danger - My Boss Is A Bitch (720)",
//       slug: "abella-danger-my-boss-is-a-bitch-720",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/36f04e6e-ffee-4d5e-89d8-05fda0958db3/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/abella-danger-my-boss-is-a-bitch-720-1780397622546.jpg",
//       duration: "31:55",
//       views: 82000,
//       category: "Hardcore",
//       pornstarId: null,
//     },
//     {
//       title: "Nicole aniston fucked hard on white Sofa (1080p)",
//       slug: "nicole-aniston-fucked-hard-on-white-sofa-1080p",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/9247e27c-5091-48f7-9e36-29358127dc12/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/nicole-aniston-fucked-hard-on-white-sofa-1080p-1780397894147.jpg",
//       duration: "31:13",
//       views: 67000,
//       category: "Hardcore",
//       pornstarId: null,
//     },
//     {
//       title: "Lisa Ann fucked in interrogation - (1080) porn video",
//       slug: "lisa-ann-fucked-in-interrogation-1080-porn-video",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/7d6f85ab-528d-4e1a-8910-5fe864c5bd69/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/lisa-ann-fucked-in-interrogation-1080-porn-video-1780398215679.jpg",
//       duration: "35:05",
//       views: 95000,
//       category: "Hardcore",
//       pornstarId: null,
//     },
//     {
//       title: "Naughty America Julia ann fucked hard on stairs - porn video",
//       slug: "naughty-america-julia-ann-fucked-hard-on-stairs-porn-video",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/5ae8c81e-1cca-47d3-8fca-e407e47cf0b1/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/naughty-america-julia-ann-fucked-hard-on-stairs-porn-video-1780398334168.jpg",
//       duration: "28:47",
//       views: 42000,
//       category: "Vanilla",
//       pornstarId: null,
//     },
//     {
//       title:
//         "Fuckin in the kitchen with lover - Nicole aniston 1080p porn video",
//       slug: "fuckin-in-the-kitchen-with-lover-nicole-aniston-1080p-porn-video",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/7fd52070-261e-4389-bfb9-986571df9cff/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/fuckin-in-the-kitchen-with-lover-nicole-aniston-1080p-porn-video-1780398440833.jpg",
//       duration: "38:07",
//       views: 110000,
//       category: "Cheating",
//       pornstarId: null,
//     },
//     {
//       title: "Lisa ann yoga fuck Porn Video - hardcore",
//       slug: "lisa-ann-yoga-fuck-porn-video-hardcore",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/82f4822d-bec4-4e28-b828-b02236473928/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/lisa-ann-yoga-fuck-porn-video-hardcore-1780398640358.jpg",
//       duration: "31:14",
//       views: 56000,
//       category: "Hardcore",
//       pornstarId: null,
//     },
//     {
//       title:
//         "Nicole aniston - fucking teacher porn video Naughty America_(1080p)",
//       slug: "nicole-aniston-fucking-teacher-porn-video-naughty-america-1080p",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/7004ff92-8e4a-471f-8ecc-ce8924f21f57/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/nicole-aniston-fucking-teacher-porn-video-naughty-america-1080p-1780398781169.jpg",
//       duration: "26:49",
//       views: 88000,
//       category: "Cheating",
//       pornstarId: null,
//     },
//     {
//       title: "Nicole aniston trapper and fucking on rooftop - Porn video",
//       slug: "nicole-aniston-trapper-and-fucking-on-rooftop-porn-video",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/9d23d95e-88f5-4389-b25d-c533349e1bbc/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/nicole-aniston-trapper-and-fucking-on-rooftop-porn-video-1780398901677.jpg",
//       duration: "26:54",
//       views: 104000,
//       category: "Hot",
//       pornstarId: null,
//     },
//     {
//       title: "Nicole aniston TonightGirlfriend porn video [720p]",
//       slug: "nicole-aniston-tonightgirlfriend-porn-video-720p",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/5f63731e-8289-4408-9873-6892d3eb3cc4/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/nicole-aniston-tonightgirlfriend-porn-video-720p-1780399160698.jpg",
//       duration: "43:29",
//       views: 32000,
//       category: "Cheating",
//       pornstarId: null,
//     },
//     {
//       title:
//         "Abella Danger - Cherie DeVille get fucked by BBC threesome - Dogfart Porn-[720]",
//       slug: "abella-danger-cherie-deville-get-fucked-by-bbc-threesome-dogfart-porn-720",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/0db55e0e-f7c0-4b9f-adbc-4e94729587bf/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/abella-danger-cherie-deville-get-fucked-by-bbc-threesome-dogfart-porn-720-1780399711552.jpg",
//       duration: "30:57",
//       views: 245000,
//       category: "Interracial",
//       pornstarId: null,
//     },
//     {
//       title: "Lisa Ann hardcore Interracial gangbang - [1080p] porn video",
//       slug: "lisa-ann-hardcore-interracial-gangbang-1080p-porn-video",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/f18fc926-be01-419a-ad20-c73882a8a2f4/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/lisa-ann-hardcore-interracial-gangbang-1080p-porn-video-1780399840341.jpg",
//       duration: "36:44",
//       views: 180000,
//       category: "Interracial",
//       pornstarId: null,
//     },
//     {
//       title: "Lisa Ann DP - BBC threesome Gangbang [1080p]",
//       slug: "lisa-ann-dp-bbc-threesome-gangbang-1080p",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/56d8d860-ee23-48fa-b3da-246e81bc41c4/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/lisa-ann-dp-bbc-threesome-gangbang-1080p-1780400058311.jpg",
//       duration: "29:23",
//       views: 320000,
//       category: "Interracial",
//       pornstarId: null,
//     },
//     {
//       title: "Nicole Aniston Johnny Catsle - hardcore fucking video - Porn",
//       slug: "nicole-aniston-johnny-catsle-hardcore-fucking-video-porn",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/d68e7251-453b-4fe6-9e8a-672b8ff4a7ee/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/nicole-aniston-johnny-catsle-hardcore-fucking-video-porn-1780400221828.jpg",
//       duration: "31:35",
//       views: 110000,
//       category: "Hot",
//       pornstarId: null,
//     },
//     {
//       title:
//         "Abella Danger fucked by BBC DogFart - CuckoldSessions(1080p) Porn",
//       slug: "abella-danger-fucked-by-bbc-dogfart-cuckoldsessions-1080p-porn",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/efbbefb7-3d2d-401e-b418-23c7e9398fd4/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/abella-danger-fucked-by-bbc-dogfart-cuckoldsessions-1080p-porn-1780401689917.jpg",
//       duration: "34:28",
//       views: 145000,
//       category: "Cuckold",
//       pornstarId: null,
//     },
//     {
//       title: "Big Tit MILF - julia ann fucked hard NaughtyAmerica Porn",
//       slug: "big-tit-milf-julia-ann-fucked-hard-naughtyamerica-porn",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/7cfe054a-be6a-43cc-a6a3-52e6ed0ffa8c/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/big-tit-milf-julia-ann-fucked-hard-naughtyamerica-porn-1780402010256.jpg",
//       duration: "26:17",
//       views: 165000,
//       category: "Hotwife",
//       pornstarId: null,
//     },
//     {
//       title: "Julia Ann Mike adriano porn video - [1080p] fullhd",
//       slug: "julia-ann-mike-adriano-porn-video-1080p-fullhd",
//       videoUrl:
//         "https://vz-dd9533b0-79d.b-cdn.net/d22268b8-5dc0-49a9-8958-b1809df33e20/playlist.m3u8",
//       thumbnail:
//         "https://porncater-pullzone.b-cdn.net/thumbnails/julia-ann-mike-adriano-porn-video-1080p-fullhd-1780402428689.jpg",
//       duration: "1:08:23",
//       views: 215000,
//       category: "Hardcore",
//       pornstarId: null,
//     },
//   ];

//   for (const v of videos) {
//     const { pornstarId, category, views, ...videoData } = v;

//     // Auto-generate standard tags based on the category so Watch Page has UI data
//     const generatedTags = category
//       ? [category, "HD", "1080p"]
//       : ["HD", "Exclusive"];

//     const payload = {
//       ...videoData,
//       category: category || "Exclusive",
//       views: views,
//       likes: Math.floor(views * 0.05), // Auto-calculate likes to ~5% of views
//       tags: generatedTags,
//       // The Smart Connect: Converts the old 1-to-Many ID into the new Many-to-Many format
//       pornstars: pornstarId
//         ? {
//             connect: [{ id: pornstarId }],
//           }
//         : undefined,
//     };

//     await prisma.video.upsert({
//       where: { slug: v.slug },
//       update: payload,
//       create: payload,
//     });
//   }

//   console.log(`✅ Successfully seeded ${videos.length} porn videos!`);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
