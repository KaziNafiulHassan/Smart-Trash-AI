
import React, { useState, useEffect } from 'react';

interface WasteBinProps {
  bin: {
    id: string;
    name: string;
    color: string;
  };
  onDrop: (binId: string) => void;
  isDropTarget: boolean;
}

const WasteBin: React.FC<WasteBinProps> = ({ bin, onDrop, isDropTarget }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Load bin image from Supabase storage
    const loadBinImage = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = supabase.storage
        .from('waste-images')
        .getPublicUrl(`${bin.id}.jpg`);
      
      setImageUrl(data.publicUrl);
    };

    loadBinImage();
  }, [bin.id]);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDropTarget) return;
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isDropTarget) return;
    e.preventDefault();
    setIsHovered(false);
    onDrop(bin.id);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${bin.color} transition-all duration-200 border-2 ${
        isHovered 
          ? 'border-yellow-400 dark:border-yellow-300 scale-110 shadow-lg shadow-yellow-400/50' 
          : 'border-white/30 dark:border-gray-600'
      } ${
        isDropTarget ? 'cursor-pointer hover:scale-105' : ''
      } overflow-hidden`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={bin.name}
          className="w-full h-full object-cover rounded-2xl"
          onError={() => {
            // Fallback if image doesn't load
            console.log(`Failed to load image for bin: ${bin.id}`);
          }}
        />
      )}
      
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 dark:bg-yellow-300/20 border-2 border-yellow-400 dark:border-yellow-300 animate-pulse" />
      )}
    </div>
  );
};

export default WasteBin;
