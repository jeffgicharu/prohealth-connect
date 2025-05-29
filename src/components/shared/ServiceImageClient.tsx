"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ServiceImageClientProps {
  src?: string | null; // The primary image URL (service.imageUrl)
  placeholderSrc: string; // The fallback placeholder URL
  alt: string;
  // Include other relevant props from next/image that you were using,
  // e.g., fill, className, sizes, priority, quality, blurDataURL
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  blurDataURL?: string;
}

export function ServiceImageClient({
  src,
  placeholderSrc,
  alt,
  fill = true, // Defaulting fill as it was used
  className = "object-cover", // Defaulting className
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px", // Defaulting sizes
  priority = false, // Defaulting priority
  quality = 90, // Defaulting quality
  blurDataURL,
}: ServiceImageClientProps) {
  const [currentSrc, setCurrentSrc] = useState(src || placeholderSrc);
  const [hasError, setHasError] = useState(false);

  // Update currentSrc if the src prop changes and there hasn't been an error with the new src
  useEffect(() => {
    if (src && src !== currentSrc && !hasError) {
      setCurrentSrc(src);
    } else if (!src) {
      setCurrentSrc(placeholderSrc);
    }
  }, [src, placeholderSrc, currentSrc, hasError]);

  const handleError = () => {
    if (currentSrc !== placeholderSrc) { // Avoid infinite loop if placeholder also fails
      setHasError(true); // Mark that an error occurred with the primary src
      setCurrentSrc(placeholderSrc);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      placeholder={blurDataURL ? "blur" : "empty"} // Only use blur if blurDataURL is provided
      blurDataURL={blurDataURL}
      onError={handleError}
      unoptimized={currentSrc === placeholderSrc && placeholderSrc.startsWith('data:image')} // Avoid optimizing tiny base64 placeholders
    />
  );
} 