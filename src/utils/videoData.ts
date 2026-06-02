export const extractVideoData = (videoFile: File): Promise<{ duration: string, thumbnail: File }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create a local URL for the video file
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = 'anonymous';
    
    // 1. Get Duration when metadata loads
    video.addEventListener('loadedmetadata', () => {
      // Seek to 10 seconds in to grab a good thumbnail (or 10% of the video)
      const targetTime = video.duration > 10 ? 10 : video.duration / 2;
      video.currentTime = targetTime;
    });

    // 2. Snap the thumbnail when it reaches the target time
    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Format duration into MM:SS
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      // Convert canvas to a File object
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbFile = new File([blob], `${videoFile.name.split('.')[0]}_thumb.jpg`, { type: 'image/jpeg' });
          URL.revokeObjectURL(video.src); // Cleanup memory
          resolve({ duration: formattedDuration, thumbnail: thumbFile });
        } else {
          reject(new Error("Canvas to Blob failed"));
        }
      }, 'image/jpeg', 0.85); // 0.85 quality for good balance of size/looks
    });

    video.addEventListener('error', (e) => {
      reject(new Error("Error loading video data"));
    });
  });
};