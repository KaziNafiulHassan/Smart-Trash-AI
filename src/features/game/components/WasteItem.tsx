import React from 'react';

interface WasteItemProps {
  item: any;
  isDraggable?: boolean;
  onDragStart?: (item: any) => void;
}

const WasteItem: React.FC<WasteItemProps> = ({ 
  item, 
  isDraggable = true, 
  onDragStart 
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    // Set drag data and effect
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';

    // Add visual feedback during drag
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.7';
    target.style.transform = 'scale(0.95)';

    if (onDragStart) {
      onDragStart(item);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.style.transform = 'scale(1)';
  };

  return (
    <div
      className={`w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg dark:shadow-2xl dark:neon-border transition-all duration-200 ${
        isDraggable ? 'cursor-move hover:scale-105 hover:shadow-xl dark:hover:neon-glow' : 'cursor-default'
      }`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="aspect-square w-full mb-3 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl sm:text-5xl">📦</span>
        )}
      </div>
      <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white text-center mb-1 dark:neon-text">
        {item.item_name}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center leading-tight">
        {item.description}
      </p>
    </div>
  );
};

export default WasteItem;
