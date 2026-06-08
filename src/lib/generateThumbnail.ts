export async function generateThumbnail(videoBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoBlob);
    video.onloadedmetadata = () => {
      video.currentTime = 1; // after 1s load the video for thumbnail.
    }
    video.onseeked = () => { // this handler triggers as soon as user finished skipping to new position in video.
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // getContext() is the method that gives you access to the canvas drawing API. 
      // Without it, you cannot draw anything on the canvas.

      const ctx = canvas.getContext('2d') // 2d drawing context for canvas to render text,pixel manipulation,etc.
      if (!ctx) {
        reject(new Error("Canvas context not found"))
        return;
      }
      ctx.drawImage(video,0,0,canvas.width,canvas.height) // params-> image,source x-axis,y-axis,destination-x-axis and y-axis
      canvas.toBlob((blob)=> { // this method creates a Blob object representing the image contained in the canvas.(1s ka hi image hai)
        if (!blob) {
          reject(
            new Error("Thumbnail generation failed"))
            return;
        }

        resolve(blob); // give the promise result 
      },
      'image/jpeg',
      0.8 // image quality scale b/w 0-1 so choose 0.8 (more accurate)
      );
    };
  });
}