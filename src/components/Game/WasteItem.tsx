
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
      className={`bg-white dark:bg-gray-800 dark:neon-border rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-purple-500/20 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] w-60 sm:w-72 ${
        isDraggable ? 'cursor-move hover:scale-105 dark:hover:neon-glow' : 'cursor-default'
      } ${isCompleted ? 'opacity-50 bg-green-100 dark:bg-green-900/30' : ''} transition-all duration-200`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.item_name}
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="text-6xl sm:text-7xl hidden">📦</div>
      </div>
      <p className="text-gray-800 dark:text-gray-200 dark:neon-text font-semibold text-base sm:text-lg text-center leading-tight">
        {item.item_name}
      </p>
      {isCompleted && (
        <div className="text-green-500 dark:text-green-400 text-3xl mt-3">✓</div>
      )}
    </div>
  );
};

export default WasteItem;
