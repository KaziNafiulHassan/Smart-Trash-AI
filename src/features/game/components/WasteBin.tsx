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
      className={`w-16 h-20 sm:w-20 sm:h-24 ${bin.color} rounded-lg flex flex-col items-center justify-center text-white transition-all duration-200 ${
        isDropTarget ? 'hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-lg sm:text-xl mb-1">🗑️</div>
      <span className="text-xs text-center font-medium px-1 leading-tight">
        {bin.name}
      </span>
    </div>
  );
};

export default WasteBin;
