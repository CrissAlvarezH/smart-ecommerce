"use client";

import { useState } from "react";
import { Folder } from "lucide-react";

interface CategoryImageProps {
  imageUrl?: string;
  categoryName: string;
  className?: string;
}

export function CategoryImage({ imageUrl, categoryName, className = "" }: CategoryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasValidImage = imageUrl && imageUrl.trim() !== '' && !imageError;

  return (
    <div className={`aspect-square overflow-hidden bg-gray-100 ${className}`}>
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={categoryName}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={() => {
            console.error(`Failed to load image for category ${categoryName}:`, imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            setImageLoaded(true);
          }}
          style={{ 
            display: imageError ? 'none' : 'block',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      ) : null}
      
      <div 
        className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
        style={{ 
          display: hasValidImage && !imageError ? 'none' : 'flex' 
        }}
      >
        <Folder className="h-16 w-16 text-gray-400" />
      </div>
    </div>
  );
}