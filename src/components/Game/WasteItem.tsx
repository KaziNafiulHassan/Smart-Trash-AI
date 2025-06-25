
import React from 'react';

interface WasteItemProps {
  item: {
    id: string;
    item_name: string;
    image_url?: string;
    description?: string;
  };
  onDragStart?: (itemId: string) => void;
  isDraggable?: boolean;
  isCompleted?: boolean;
}

const WasteItem: React.FC<WasteItemProps> = ({ 
  item, 
  onDragStart, 
  isDraggable = false,
  isCompleted = false 
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable && onDragStart) {
      onDragStart(item.id);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 dark:neon-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-purple-500/20 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] w-72 sm:w-80 lg:w-96 ${
        isDraggable ? 'cursor-move hover:scale-105 dark:hover:neon-glow' : 'cursor-default'
      } ${isCompleted ? 'opacity-50 bg-green-100 dark:bg-green-900/30' : ''} transition-all duration-200`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mb-6 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.item_name}
            className="w-full h-full object-contain rounded-xl shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="text-6xl sm:text-7xl hidden">📦</div>
      </div>
      <h3 className="text-gray-800 dark:text-gray-200 dark:neon-text font-bold text-lg sm:text-xl lg:text-2xl text-center leading-tight max-w-xs">
        {item.item_name}
      </h3>
      {isCompleted && (
        <div className="text-green-500 dark:text-green-400 text-3xl mt-3">✓</div>
      )}
    </div>
  );
};

export default WasteItem;
