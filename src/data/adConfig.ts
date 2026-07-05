// src/data/adConfig.ts

export interface AffiliateBanner {
  imageUrl: string;
  targetUrl: string;
  altText: string;
}

// 728x90 - Perfect for directly under the Video Player
export const blackedLeaderboards: AffiliateBanner[] = [
  {
    // Upload the downloaded image to Bunny CDN and put your URL here
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-728x90-3377.jpg", 
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zMzc3LjAuMC4w",
    altText: "Blacked Premium Access"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-728x90-3296.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zMjk2LjAuMC4w",
    altText: "Blacked Exclusive Scene"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-728x90-3298.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zMjk4LjAuMC4w",
    altText: "Watch Full Blacked Video"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-728x90-3232.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zMjMyLjAuMC4w",
    altText: "Blacked Network HD"
  }
];

// 970x90 - "Super Leaderboard" - Perfect for the top of Trending/Category grids
export const blackedSuperLeaderboards: AffiliateBanner[] = [
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-970x90-3414.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zNDE0LjAuMC4w",
    altText: "Blacked Premium"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-970x90-3416.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zNDE2LjAuMC4w",
    altText: "Blacked Premium"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-970x90-3417.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zNDE3LjAuMC4w",
    altText: "Blacked Premium"
  },
  {
    imageUrl: "https://your-bunny-cdn-url.com/banners/blacked-970x90-3378.jpg",
    targetUrl: "https://join.blacked.com/track/MjUzMy4yLjMuMjcuMC4zMzc4LjAuMC4w",
    altText: "Blacked Premium"
  }
];