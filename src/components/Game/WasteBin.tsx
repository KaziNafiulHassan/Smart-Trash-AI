
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    loadBinImage();
  }, [bin.id]);

  const loadBinImage = async () => {
    try {
      console.log('Loading bin image for:', bin.id);
      
      // Try different image formats and naming conventions
      const formats = ['png', 'jpg', 'jpeg'];
      const namingVariations = [bin.id, bin.id.toLowerCase(), bin.id.toUpperCase()];
      
      for (const name of namingVariations) {
        for (const format of formats) {
          const { data } = await supabase.storage
            .from('bin-images')
            .getPublicUrl(`${name}.${format}`);
          
          if (data?.publicUrl) {
            console.log('Trying bin image URL:', data.publicUrl);
            
            // Test if the image actually exists
            try {
              const response = await fetch(data.publicUrl, { method: 'HEAD' });
              if (response.ok) {
                console.log('Found working bin image:', data.publicUrl);
                setImageUrl(data.publicUrl);
                return;
              }
            } catch (error) {
              console.log(`Image not found: ${name}.${format}`);
            }
          }
        }
      }
      
      console.log('No bin image found for:', bin.id);
      console.log('Available naming variations tried:', namingVariations);
    } catch (error) {
      console.error('Error loading bin image:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDropTarget) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isDropTarget && onDrop) {
      e.preventDefault();
      onDrop(bin.id);
    }
  };

  const handleImageLoad = () => {
    console.log('Bin image loaded successfully for:', bin.id);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.log('Failed to load bin image, falling back to emoji for:', bin.id);
    setImageUrl(null);
    setImageLoaded(false);
  };

  return (
    <div
      className={`${bin.color} dark:${bin.color.replace('bg-', 'bg-opacity-80 bg-')} rounded-2xl p-2 w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-lg ${
        isDropTarget ? 'border-2 border-dashed border-white/50 scale-105' : ''
      } transition-all duration-200 hover:scale-105 cursor-pointer`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imageUrl && !imageLoaded && (
        <div className="text-lg sm:text-xl mb-1">🗑️</div>
      )}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={bin.name}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain mb-1"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      ) : (
        <div className="text-lg sm:text-xl mb-1">🗑️</div>
      )}
      <h3 className="text-white font-bold text-xs text-center leading-tight">{bin.name}</h3>
    </div>
  );
};

export default WasteBin;
