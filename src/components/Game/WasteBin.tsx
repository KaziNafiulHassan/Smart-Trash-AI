
import React from 'react';

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
      className={`${bin.color} rounded-2xl p-4 min-h-[120px] flex flex-col items-center justify-center shadow-lg ${
        isDropTarget ? 'border-2 border-dashed border-white/50' : ''
      } transition-all duration-200 hover:scale-105`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-4xl mb-2">🗑️</div>
      <h3 className="text-white font-bold text-lg text-center">{bin.name}</h3>
    </div>
  );
};

export default WasteBin;
