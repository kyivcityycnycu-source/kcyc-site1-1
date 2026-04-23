/**
 * Preloads a list of images by adding link tags to the head.
 * This instructs the browser to start downloading images as soon as possible.
 */
export const preloadImageUrls = (urls: string[]) => {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    if (!url) return;
    
    // Check if duplicate
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};
