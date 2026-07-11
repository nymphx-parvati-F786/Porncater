import ytDlp from 'yt-dlp-exec';

async function testExtraction() {
  const testUrl = "https://www.pornflip.com/AVxZRVxKZL4/blacked-theodora-day-bbc-curious-baddie-ditches-bf-hd-lesbian-porn";
  console.log(`[Test] Connecting to: ${testUrl}`);
  
  try {
    // We are passing dumpJson to see if the site gives us the video data, 
    // or if it blocks us with a Cloudflare/403 error.
    const metadata = await ytDlp(testUrl, { 
      dumpJson: true, 
      noWarnings: true 
    });
    
    console.log(`\n✅ [SUCCESS] The site is compatible!`);
    console.log(`Title: ${metadata.title}`);
    console.log(`Duration: ${metadata.duration} seconds`);
    
  } catch (error) {
    console.error(`\n❌ [BLOCKED] yt-dlp failed to extract the video.`);
    console.error(`Reason:\n`, error);
  }
}

testExtraction();