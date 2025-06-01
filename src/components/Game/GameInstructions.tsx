
import React from 'react';
import { Language } from '@/pages/Index';

interface GameInstructionsProps {
  language: Language;
  currentItemIndex: number;
  totalItems: number;
}

const texts = {
  EN: {
    dragInstruction: 'Drag the item to the correct bin'
  },
  DE: {
    dragInstruction: 'Ziehe den Gegenstand in die richtige Tonne'
  }
};

const GameInstructions: React.FC<GameInstructionsProps> = ({
  language,
  currentItemIndex,
  totalItems
}) => {
  const t = texts[language];

  return (
    <div className="text-center mb-6 sm:mb-8">
      <p className="text-sm sm:text-base text-blue-100 dark:text-cyan-200">{t.dragInstruction}</p>
      <p className="text-xs sm:text-sm text-blue-200 dark:text-cyan-300 mt-1">
        Item {currentItemIndex + 1} of {totalItems}
      </p>
    </div>
  );
};

export default GameInstructions;
