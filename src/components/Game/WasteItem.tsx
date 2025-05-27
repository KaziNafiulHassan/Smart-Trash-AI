
import React from 'react';

interface WasteItemProps {
  item: {
    id: string;
    item_name: string;
    emoji?: string;
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
      className={`bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center min-h-[100px] ${
        isDraggable ? 'cursor-move hover:scale-105' : 'cursor-default'
      } ${isCompleted ? 'opacity-50 bg-green-100' : ''} transition-all duration-200`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="text-3xl mb-2">
        {item.emoji || '📦'}
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
