import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File | Blob> => {
  const options = {
    maxSizeMB: 1, // Max size 1MB
    maxWidthOrHeight: 1920, // Max width/height 1920px
    useWebWorker: true,
    fileType: 'image/webp' // Convert to webp for better compression
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    return file; // Return original file if compression fails
  }
};
