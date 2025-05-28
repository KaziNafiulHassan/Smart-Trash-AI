
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
      className={`bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center min-h-[120px] ${
        isDraggable ? 'cursor-move hover:scale-105' : 'cursor-default'
      } ${isCompleted ? 'opacity-50 bg-green-100' : ''} transition-all duration-200`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="w-16 h-16 mb-2 flex items-center justify-center">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.item_name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              // Fallback to a default icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="text-3xl hidden">📦</div>
      </div>
      <p className="text-gray-800 font-medium text-sm text-center leading-tight">
        {item.item_name}
      </p>
      {isCompleted && (
        <div className="text-green-500 text-xl mt-1">✓</div>
      )}
    </div>
  );
};

export default WasteItem;
