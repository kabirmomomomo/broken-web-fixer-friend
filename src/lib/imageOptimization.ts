import { toast } from "@/components/ui/sonner";

export const optimizeImage = async (file: File): Promise<File> => {
  try {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Create an image element
    const img = new Image();
    
    // Create a promise to handle image loading
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Set the image source
    img.src = URL.createObjectURL(file);

    // Wait for the image to load
    await imageLoadPromise;

    // Calculate new dimensions while maintaining aspect ratio
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to WebP format
    const webpBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/webp', 0.8);
    });

    // Create a new file from the blob
    const optimizedFile = new File([webpBlob], file.name.replace(/\.[^/.]+₹/, '.webp'), {
      type: 'image/webp',
    });

    // Clean up
    URL.revokeObjectURL(img.src);

    return optimizedFile;
  } catch (error) {
    console.error('Error optimizing image:', error);
    toast.error('Failed to optimize image, using original');
    return file;
  }
}; 
