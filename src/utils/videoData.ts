export const extractVideoData = (videoFile: File): Promise<{ duration: string, thumbnail: File }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = 'anonymous';
    
    video.addEventListener('loadedmetadata', () => {
      const targetTime = video.duration > 10 ? 10 : video.duration / 2;
      video.currentTime = targetTime;
    });

    video.addEventListener('seeked', () => {
      // 🔥 HARDCODE TUBE GRID DIMENSIONS: 480x270 (16:9)
      // This prevents uploading 1080p/4K frames as thumbnails!
      canvas.width = 480;
      canvas.height = 270;
      
      // Draw scaled down frame
      ctx?.drawImage(video, 0, 0, 480, 270);
      
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      // 🔥 EXPORT AS WEBP AT 50% QUALITY (~12KB FILE SIZE)
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbFile = new File(
            [blob], 
            `${videoFile.name.split('.')[0]}_thumb.webp`, 
            { type: 'image/webp' }
          );
          URL.revokeObjectURL(video.src);
          resolve({ duration: formattedDuration, thumbnail: thumbFile });
        } else {
          reject(new Error("Canvas to Blob failed"));
        }
      }, 'image/webp', 0.50); // 0.50 quality WebP gives maximum compression
    });

    video.addEventListener('error', () => {
      reject(new Error("Error loading video data"));
    });
  });
};