import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Global memory cache to track images that have already been loaded in this session
const loadedImageCache = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  isPriority?: boolean;
}

// Extend React's HTMLAttributes to satisfy fetchPriority until types are updated
declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName = "",
  isPriority = false,
  loading,
  ...props 
}) => {
  // Use cache to immediately set isLoaded if we've seen this URL before
  const [isLoaded, setIsLoaded] = useState(src ? loadedImageCache.has(src) : false);
  
  // Separate motion-conflicting props
  const { onDrag, onDragStart, onDragEnd, ...restProps } = props as any;

  useEffect(() => {
    if (src && loadedImageCache.has(src)) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    if (src) loadedImageCache.add(src);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Shimmer - Only show if it's the first time we see this image */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      
      <motion.img
        src={src}
        alt={alt}
        initial={isLoaded ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: isLoaded ? 0 : 0.3 }}
        onLoad={handleLoad}
        loading={loading || (isPriority ? "eager" : "lazy")}
        fetchPriority={isPriority ? "high" : "auto"}
        decoding={isPriority ? "sync" : "async"}
        className={`${className} ${isLoaded ? '' : 'absolute top-0 left-0 w-full h-full opacity-0'}`}
        {...restProps}
      />
    </div>
  );
};
