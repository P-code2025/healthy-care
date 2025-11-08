// Temporary image storage using memory (for testing)
// In production, should use cloud storage like S3, Cloudinary, etc.

const imageCache = new Map();

export function saveImageTemporarily(base64Image, imageId) {
  imageCache.set(imageId, base64Image);
  
  // Auto cleanup after 5 minutes
  setTimeout(() => {
    imageCache.delete(imageId);
  }, 5 * 60 * 1000);
  
  return imageId;
}

export function getImage(imageId) {
  return imageCache.get(imageId);
}

export function hasImage(imageId) {
  return imageCache.has(imageId);
}
