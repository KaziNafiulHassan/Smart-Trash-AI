
import React from 'react';
import { Language } from '@/types/common';
import WasteBin from './WasteBin';

interface GameBinsGridProps {
  language: Language;
  onDrop: (binId: string) => void;
}

const GameBinsGrid: React.FC<GameBinsGridProps> = ({
  language,
  onDrop
}) => {
  const bins = [
    { 
      id: 'residual', 
      name: language === 'EN' ? 'Residual Waste Bin' : 'Restmüll', 
      color: 'bg-gray-600 dark:bg-gray-800 dark:neon-glow'
    },
    { 
      id: 'paper', 
      name: language === 'EN' ? 'Paper Bin' : 'Papier', 
      color: 'bg-red-500 dark:bg-red-800 dark:neon-glow'
    },
    { 
      id: 'bio', 
      name: language === 'EN' ? 'Bio Bin' : 'Bio', 
      color: 'bg-amber-600 dark:bg-amber-800 dark:neon-glow'
    },
    { 
      id: 'plastic', 
      name: language === 'EN' ? 'Lightweight Packaging Bin' : 'Leichtverpackung', 
      color: 'bg-yellow-500 dark:bg-yellow-700 dark:neon-glow'
    },
    { 
      id: 'glass', 
      name: language === 'EN' ? 'Waste Glass Container' : 'Altglas', 
      color: 'bg-green-600 dark:bg-green-800 dark:neon-glow'
    },
    { 
      id: 'hazardous', 
      name: language === 'EN' ? 'Hazardous Waste Mobile or Collection Points' : 'Sondermüll', 
      color: 'bg-orange-600 dark:bg-orange-800 dark:neon-glow'
    },
    { 
      id: 'bulky', 
      name: language === 'EN' ? 'Bulky Waste Container' : 'Sperrmüll', 
      color: 'bg-purple-600 dark:bg-purple-800 dark:neon-glow'
    }
  ];

  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="space-y-3 sm:space-y-4">
        {/* First row - 4 bins */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {bins.slice(0, 4).map((bin) => (
            <WasteBin
              key={bin.id}
              bin={bin}
              onDrop={onDrop}
              isDropTarget={true}
            />
          ))}
        </div>
        {/* Second row - 3 bins */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {bins.slice(4, 7).map((bin) => (
            <WasteBin
              key={bin.id}
              bin={bin}
              onDrop={onDrop}
              isDropTarget={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBinsGrid;
