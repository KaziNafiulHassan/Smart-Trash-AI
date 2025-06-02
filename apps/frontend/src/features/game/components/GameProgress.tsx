
import React from 'react';

interface GameProgressProps {
  allItems: any[];
  currentItemIndex: number;
}

const GameProgress: React.FC<GameProgressProps> = ({
  allItems,
  currentItemIndex
}) => {
  return (
    <div className="flex justify-center space-x-2 mb-4">
      {allItems.map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            index < currentItemIndex ? 'bg-green-400' : 
            index === currentItemIndex ? 'bg-blue-400' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  );
};

export default GameProgress;
