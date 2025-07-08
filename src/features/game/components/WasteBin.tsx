
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { gameSoundService } from '@/services/gameSoundService';

interface WasteBinProps {
  bin: {
    id: string;
    name: string;
    color: string;
  };
  onDrop?: (binId: string) => void;
  isDropTarget?: boolean;
}

const WasteBin: React.FC<WasteBinProps> = ({ bin, onDrop, isDropTarget = false }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadBinImage();
  }, [bin.id]);

  const loadBinImage = async () => {
    try {
      console.log('Loading bin image for:', bin.id);
      
      // Try different image formats
      const formats = ['png', 'jpg', 'jpeg'];
      
      for (const format of formats) {
        const { data } = supabase.storage
          .from('bin-images')
          .getPublicUrl(`${bin.id}.${format}`);
        
        if (data?.publicUrl) {
          console.log('Trying bin image URL:', data.publicUrl);
          
          // Test if the image actually exists by trying to load it
          const img = new Image();
          img.onload = () => {
            console.log('Found working bin image:', data.publicUrl);
            setImageUrl(data.publicUrl);
            setImageLoaded(false); // Reset for new image
            setImageError(false);
          };
          img.onerror = () => {
            console.log(`Image not found: ${bin.id}.${format}`);
          };
          img.src = data.publicUrl;
          
          // If we find a working URL, break out of the loop
          if (img.complete && img.naturalHeight !== 0) {
            break;
          }
        }
      }
      
      // If no image found, we'll rely on the fallback emoji
      if (!imageUrl) {
        console.log('No bin image found for:', bin.id);
        setImageError(true);
      }
    } catch (error) {
      console.error('Error loading bin image:', error);
      setImageError(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDropTarget) {
      e.preventDefault();
      e.stopPropagation();
      // Set the drop effect to indicate this is a valid drop target
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (isDropTarget) {
      e.preventDefault();
      e.stopPropagation();
      // Play hover sound when dragging over bin
      gameSoundService.playSound('drag-hover');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isDropTarget) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isDropTarget && onDrop) {
      e.preventDefault();
      e.stopPropagation();

      // Add a small delay to ensure smooth animation
      setTimeout(() => {
        onDrop(bin.id);
      }, 50);
    }
  };

  const handleImageLoad = () => {
    console.log('Bin image loaded successfully for:', bin.id);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log('Failed to load bin image, falling back to emoji for:', bin.id);
    setImageError(true);
    setImageLoaded(false);
  };

  // Bin-specific emojis as fallbacks
  const getBinEmoji = (binId: string) => {
    switch (binId) {
      case 'residual': return '🗑️';
      case 'paper': return '📄';
      case 'bio': return '🍎';
      case 'plastic': return '♻️';
      case 'glass': return '🍶';
      case 'hazardous': return '☢️';
      case 'bulky': return '📦';
      default: return '🗑️';
    }
  };

  return (
    <div
      className={`${bin.color} dark:${bin.color.replace('bg-', 'bg-opacity-80 bg-')} rounded-2xl p-3 w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-center shadow-lg ${
        isDropTarget ? 'border-2 border-dashed border-white/50 scale-105' : ''
      } transition-all duration-200 hover:scale-105 cursor-pointer`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="text-2xl sm:text-3xl mb-2">{getBinEmoji(bin.id)}</div>
            )}
            <img 
              src={imageUrl} 
              alt={bin.name}
              className={`w-16 h-16 sm:w-20 sm:h-20 object-contain ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="text-2xl sm:text-3xl mb-2">{getBinEmoji(bin.id)}</div>
        )}
        
        <span className="text-xs text-center font-medium text-white leading-tight px-1 mt-1">
          {bin.name.length > 15 ? bin.name.substring(0, 15) + '...' : bin.name}
        </span>
      </div>
    </div>
  );
};

export default WasteBin;
