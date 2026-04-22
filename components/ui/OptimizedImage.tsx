import React, { useState } from 'react';
import { motion } from 'motion/react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName = "",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        onLoad={() => setIsLoaded(true)}
        className={`${className} ${isLoaded ? '' : 'absolute top-0 left-0 w-full h-full'}`}
        {...props}
      />
    </div>
  );
};
