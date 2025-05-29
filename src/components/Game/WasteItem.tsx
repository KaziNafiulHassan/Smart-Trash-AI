
import React, { useState } from 'react';

interface WasteItemProps {
  item: {
    id: string;
    item_name: string;
    emoji?: string;
    image_url?: string;
  };
  onDragStart: (itemId: string) => void;
  isDraggable: boolean;
  isCompleted: boolean;
}

const WasteItem: React.FC<WasteItemProps> = ({ item, onDragStart, isDraggable, isCompleted }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable || isCompleted) return;
    setIsDragging(true);
    onDragStart(item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`relative bg-white/90 dark:bg-gray-800/90 rounded-2xl p-4 sm:p-6 shadow-lg border-2 transition-all duration-200 ${
        isDraggable && !isCompleted
          ? 'cursor-grab hover:scale-105 border-blue-300 dark:border-cyan-400'
          : 'cursor-default border-gray-300 dark:border-gray-600'
      } ${
        isDragging ? 'scale-110 shadow-2xl rotate-3 opacity-80' : ''
      } ${
        isCompleted ? 'opacity-50 grayscale' : ''
      }`}
      draggable={isDraggable && !isCompleted}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="text-center">
        {item.emoji && (
          <div className="text-4xl sm:text-6xl mb-2">{item.emoji}</div>
        )}
        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.item_name}
            className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 object-contain"
          />
        )}
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
          {item.item_name}
        </p>
      </div>
      
      {isDraggable && !isCompleted && (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-blue-400/50 dark:border-cyan-400/50 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}
    </div>
  );
};

export default WasteItem;
