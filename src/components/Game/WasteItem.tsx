
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
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable || isCompleted) return;
    setIsDragging(true);
    onDragStart(item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable || isCompleted) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    onDragStart(item.id);
    setIsDragging(true);
    
    // Prevent default behavior
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    
    // Update position
    element.style.position = 'fixed';
    element.style.left = `${touch.clientX - 50}px`;
    element.style.top = `${touch.clientY - 50}px`;
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    
    // Prevent scrolling
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    
    const touch = e.changedTouches[0];
    const element = e.currentTarget as HTMLElement;
    
    // Reset element styles
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.zIndex = '';
    element.style.pointerEvents = '';
    
    // Find the element under the touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const binElement = elementBelow?.closest('[data-bin-id]');
    
    if (binElement) {
      const binId = binElement.getAttribute('data-bin-id');
      if (binId) {
        // Trigger drop event
        const dropEvent = new CustomEvent('touchDrop', { 
          detail: { binId, itemId: item.id } 
        });
        document.dispatchEvent(dropEvent);
      }
    }
    
    setTouchStart(null);
    setIsDragging(false);
    
    e.preventDefault();
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
