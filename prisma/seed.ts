import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== SEED SCRIPT STARTED ===");

  // ==================== PORNSTARS ====================
  const sunny = await prisma.pornstar.upsert({
    where: { slug: 'sunny-leone' },
    update: {},
    create: {
      name: 'Sunny Leone',
      slug: 'sunny-leone',
      image: '/thumbnails/pornstars/sunny.jpg',
      bio: 'Popular Indian-Canadian adult actress',
    },
  });

  const emily = await prisma.pornstar.upsert({
    where: { slug: 'emily-willis' },
    update: {},
    create: {
      name: 'Emily Willis',
      slug: 'emily-willis',
      image: '/thumbnails/pornstars/emilywillis_thmbnl_0002.jpg',
      bio: 'Famous American adult film actress known for intense scenes',
    },
  });

  const lana = await prisma.pornstar.upsert({
    where: { slug: 'lana-rhoades' },
    update: {},
    create: {
      name: 'Lana Rhoades',
      slug: 'lana-rhoades',
      image: '/thumbnails/pornstars/lanarhoades_thmbnl_0005.jpg',
      bio: 'Stunning American adult actress',
    },
  });

  const katana = await prisma.pornstar.upsert({
    where: { slug: 'katana-kombat' },
    update: {},
    create: {
      name: 'Katana Kombat',
      slug: 'katana-kombat',
      image: '/thumbnails/pornstars/katanakombat_thmbnl_0007.jpg',
      bio: 'Hot Latina adult star',
    },
  });

  const luna = await prisma.pornstar.upsert({
    where: { slug: 'luna-star' },
    update: {},
    create: {
      name: 'Luna Star',
      slug: 'luna-star',
      image: '/thumbnails/pornstars/lunastar_thmbnl_0006.jpg',
      bio: 'Cuban-American adult film actress',
    },
  });

  const mia = await prisma.pornstar.upsert({
    where: { slug: 'mia-malkova' },
    update: {},
    create: {
      name: 'Mia Malkova',
      slug: 'mia-malkova',
      image: '/thumbnails/pornstars/miamalkova_thmbnl_0009.jpg',
      bio: 'Popular American adult actress',
    },
  });

  const savannah = await prisma.pornstar.upsert({
    where: { slug: 'savannah-bond' },
    update: {},
    create: {
      name: 'Savannah Bond',
      slug: 'savannah-bond',
      image: '/thumbnails/pornstars/savannahbond_thmbnl_0004.jpg',
      bio: 'Australian adult film star',
    },
  });

  const blake = await prisma.pornstar.upsert({
    where: { slug: 'blake-blossom' },
    update: {},
    create: {
      name: 'Blake Blossom',
      slug: 'blake-blossom',
      image: '/thumbnails/pornstars/blakeblossom_thmbnl_0008.jpg',
      bio: 'Busty American adult actress',
    },
  });

  const jennifer = await prisma.pornstar.upsert({
    where: { slug: 'jennifer-white' },
    update: {},
    create: {
      name: 'Jennifer White',
      slug: 'jennifer-white',
      image: '/thumbnails/pornstars/jenniferwhite_thmbnl_0003.jpg',
      bio: 'Experienced MILF adult actress',
    },
  });

  // ==================== VIDEOS ====================
  await prisma.video.createMany({
    data: [
      {
        title: "MILF Jennifer White Cuckold Hubby To Fuck BBC",
        slug: "jennifer-white-cuckold-bbc",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/3802ca15-30e8-40dd-9d30-8758946af0fd/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000001.png",
        duration: "32:13",
        views: 245000,
        category: "MILF",
        pornstarId: jennifer.id,
      },
      {
        title: "Ass Masterpiece With Lana (Lana Rhoades)",
        slug: "lana-rhoades-ass-masterpiece",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/73a8f374-0a2d-401f-b2a2-44c2d882cc02/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000002.png",
        duration: "1:11:49",
        views: 189000,
        category: "Anal",
        pornstarId: lana.id,
      },
      {
        title: "The Dutiful Wife (Katana Kombat) - Real Wife Stories",
        slug: "katana-kombat-dutiful-wife",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/26a17dac-7888-49f2-9110-518e11356393/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000003.png",
        duration: "45:00",
        views: 312000,
        category: "Wife",
        pornstarId: katana.id,
      },
      {
        title: "How Much Hindu Girls Love Muslim Circumcised Cocks",
        slug: "hindu-girls-muslim-cocks",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/2eb28b31-7e35-4fec-a91e-307af77505ac/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000004.png",
        duration: "11:24",
        views: 98000,
        category: "Desi",
      },
      {
        title: "Emily Willis BBC Double Penetration",
        slug: "emily-willis-bbc-double-penetration",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/793b3529-f1ad-4dfc-bd76-235b0d7899a3/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000005.png",
        duration: "45:08",
        views: 24000,
        category: "Interracial",
        pornstarId: emily.id,
      },
      {
        title: "Luna Star - Anal First date",
        slug: "luna-star-anal-first-date",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/7d196552-7b6d-44cd-9f86-30b6433947c9/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000006.png",
        duration: "31:50",
        views: 53000,
        category: "Anal",
        pornstarId: luna.id,
      },
      {
        title: "Sunny Leone - Purple Pleasure",
        slug: "sunny-leone-purple-pleasure",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/b33dc70b-ab26-458d-b402-f4da8c0699b2/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000007.png",
        duration: "07:51",
        views: 112000,
        category: "Desi",
        pornstarId: sunny.id,
      },
      {
        title: "Mia Malkova, Riley Reid, Lena The Plug & Salomelons Garage Masturbation",
        slug: "mia-malkova-garage-masturbation",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/63166b0a-9c15-4e33-ad47-cb7fd174f860/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000008.png",
        duration: "08:46",
        views: 228000,
        category: "Masturbation",
        pornstarId: mia.id,
      },
      {
        title: "Sunny Leone - Fucked hard on hot Red Sofa",
        slug: "sunny-leone-red-sofa",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/32b522e1-8959-4c48-babe-d2be4fcfaccb/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_000009.png",
        duration: "15:09",
        views: 78000,
        category: "Desi",
        pornstarId: sunny.id,
      },
      {
        title: "Fuck The Architect (Savannah Bond)",
        slug: "savannah-bond-fuck-architect",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/530f5eda-fbfb-4c60-8d7e-3bd324d0ccd8/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000010.png",
        duration: "40:44",
        views: 58000,
        category: "Hardcore",
        pornstarId: savannah.id,
      },
      {
        title: "Blake Blossom fucked hard by BBC in her Mansion",
        slug: "blake-blossom-bbc-mansion",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/5c096eb7-7c63-4f9a-8748-44ef3bdf3fe6/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000011.png",
        duration: "37:37",
        views: 128000,
        category: "Interracial",
        pornstarId: blake.id,
      },
      {
        title: "She Loves taking BBC in her Ass - Emily Willis",
        slug: "emily-willis-bbc-anal",
        videoUrl: "https://vz-dd9533b0-79d.b-cdn.net/125aff86-d1fb-46ad-8e9e-c74d344ef6fe/playlist.m3u8",
        thumbnail: "https://porncater-pullzone.b-cdn.net/thumbnails/thmbnl_0000012.png",
        duration: "45:06",
        views: 337000,
        category: "Anal",
        pornstarId: emily.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ All videos and pornstars seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });