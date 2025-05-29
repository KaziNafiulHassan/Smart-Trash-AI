
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

  useEffect(() => {
    // Listen for custom touch drop events
    const handleTouchDrop = (e: CustomEvent) => {
      if (e.detail.binId === bin.id) {
        onDrop(bin.id);
      }
    };

    document.addEventListener('touchDrop', handleTouchDrop as EventListener);
    
    return () => {
      document.removeEventListener('touchDrop', handleTouchDrop as EventListener);
    };
  }, [bin.id, onDrop]);

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
      data-bin-id={bin.id}
      className={`relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${bin.color} transition-all duration-200 border-2 ${
        isHovered 
          ? 'border-yellow-400 dark:border-yellow-300 scale-110 shadow-lg shadow-yellow-400/50' 
          : 'border-white/30 dark:border-gray-600'
      } ${
        isDropTarget ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center p-2">
        <div className="text-2xl sm:text-3xl mb-1">🗑️</div>
        <p className="text-xs sm:text-sm font-medium text-white dark:text-gray-100 leading-tight">
          {bin.name}
        </p>
      </div>
      
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 dark:bg-yellow-300/20 border-2 border-yellow-400 dark:border-yellow-300 animate-pulse" />
      )}
    </div>
  );
};

export default WasteBin;
