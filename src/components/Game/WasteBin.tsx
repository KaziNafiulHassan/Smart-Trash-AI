
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

  useEffect(() => {
    loadBinImage();
  }, [bin.id]);

  const loadBinImage = async () => {
    try {
      const { data } = await supabase.storage
        .from('bin-images')
        .getPublicUrl(`${bin.id}.png`);
      
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
      }
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

  return (
    <div
      className={`${bin.color} rounded-2xl p-2 w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-lg ${
        isDropTarget ? 'border-2 border-dashed border-white/50 scale-105' : ''
      } transition-all duration-200 hover:scale-105 cursor-pointer`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={bin.name}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain mb-1"
          onError={() => setImageUrl(null)}
        />
      ) : (
        <div className="text-lg sm:text-xl mb-1">🗑️</div>
      )}
      <h3 className="text-white font-bold text-xs text-center leading-tight">{bin.name}</h3>
    </div>
  );
};

export default WasteBin;
